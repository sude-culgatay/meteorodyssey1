import os
from django.shortcuts import render
import requests
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest
import json
from google import genai
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()


def home(request):
    return render(request, "index.html")

def videos(request):
    return render(request, "videos.html")

def name_3d(name:str):
    new_name = name.replace(" ", "_").replace("(", "").replace(")", "").strip().lower()
    return new_name

def today():
    return datetime.now().strftime("%Y-%m-%d")

def neo_details(date:str):
    API_KEY = settings.NASA_API_KEY
    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={date}&end_date=&api_key={API_KEY}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        neos_all = []

        # 7 günlük veriyi birleştir
        for day, neos in data.get("near_earth_objects", {}).items():
            neos_all.extend(neos)

        # Tarihe göre sıralama (en yakın tarih en üstte)
        def get_approach_date(neo):
            try:
                date_str = neo["close_approach_data"][0]["close_approach_date"]
                return datetime.strptime(date_str, "%Y-%m-%d")
            except (IndexError, KeyError):
                return datetime.max  # veri yoksa en sona at
        
        sorted_neos = sorted(neos_all, key=get_approach_date)

        return sorted_neos
    else:
        raise Exception(f"API error: {response.status_code}")

def explore(request):
    asteroids_raw = neo_details(today())
    asteroids = []

    for a in asteroids_raw:
        approach_data = a["close_approach_data"][0]

        asteroid_info = {
            "name": a["name"],
            "id": a["id"],
            "approach_date": approach_data.get("close_approach_date_full"),
            "distance_km": f"{float(approach_data['miss_distance']['kilometers']):.2f}",
            "velocity_kph": f"{float(approach_data['relative_velocity']['kilometers_per_hour']):.2f}",
            "abs_magnitude": f"{float(a['absolute_magnitude_h']):.2f}",
            "diameter_min": f"{float(a['estimated_diameter']['meters']['estimated_diameter_min']):.2f}",
            "diameter_max": f"{float(a['estimated_diameter']['meters']['estimated_diameter_max']):.2f}",
            "hazardous": a["is_potentially_hazardous_asteroid"],
            "nasa_url": a["nasa_jpl_url"],
            "is_sentry": a["is_sentry_object"],
            "name_3d": name_3d(a["name"])
        }

        asteroids.append(asteroid_info)

    return render(request, "explore.html", {"asteroids": asteroids, "asteroid_count": len(asteroids_raw)})

def ask_question(request, asteroid_name: str):
    # Burada kullanıcıdan gelen soruyu işleyebilir ve yanıtlayabilirsiniz.
    question = request.GET.get("question", "")
    answer = f"{asteroid_name} hakkında sorduğunuz soru: '{question}' alındı. Şu anda yanıt veremiyorum."
    return render(request, "ask_question.html", {"asteroid_name": asteroid_name, "question": question, "answer": answer})


def game_questions(request):
    """Return JSON list of questions from the DB for the game.

    Each question object in the response will have the shape:
      { id, question, choices: [...], answer, hint, points }
    """
    try:
        from .models import Question
    except Exception:
        return JsonResponse({'error': 'Question model not available.'}, status=500)

    qs = Question.objects.all()
    questions = []
    for q in qs:
        questions.append({
            'id': q.id,
            'question': q.question,
            'choices': [q.choice1, q.choice2, q.choice3, q.choice4],
            'answer': q.answer,
            'hint': q.hint or '',
            'points': q.points,
        })

    return JsonResponse({'questions': questions})

def asteroid_speed_compare(speed_kmh, distance_km):
    # Karşılaştırmalar için sabitler
    speed_kmh = float(speed_kmh)
    distance_km = float(distance_km)

    earth_circumference_km = 40075  # Dünya çevresi (km)
    earth_to_moon_distance_km = 384400  # Dünya'dan Ay'a ortalama mesafe (km)
    asia_continent_km = 62800  # Asya kıtasının çevre uzunluğu (km)
    plane_speed = 900               # Yolcu uçağı (km/saat)
    bullet_speed = 1200             # Ortalama mermi hızı (km/saat)
    f1_speed = 375                  # Formula 1 aracı (km/saat)
    
    # Hız Hesaplamaları
    times_plane = speed_kmh / plane_speed
    times_bullet = speed_kmh / bullet_speed
    times_f1 = speed_kmh / f1_speed
    
    # Mesafe Hesaplamaları
    rotate_count = distance_km / earth_circumference_km
    earth_to_moon_count = distance_km / earth_to_moon_distance_km
    asia_count = distance_km / asia_continent_km

    return {
        "times_plane": f"{times_plane:.1f}",
        "times_bullet": f"{times_bullet:.1f}",
        "times_f1": f"{times_f1:.1f}",
        "rotate_count": f"{rotate_count:.1f}",
        "earth_to_moon_count": f"{earth_to_moon_count:.1f}",
        "asia_count": f"{asia_count:.1f}"
    }


def get_impact_probability(designation: str) -> str:
    base_url = f"https://ssd-api.jpl.nasa.gov/sentry.api?des={designation}"

    try:
        response = requests.get(base_url, timeout=10)
        data = response.json()

        if "error" in data:
            return "0.0%"

        ip_values = []
        for event in data.get("data", []):
            try:
                ip = float(event.get("ip", 0))
                ip_values.append(ip)
            except (ValueError, TypeError):
                continue

        if not ip_values:
            return "0.0%"

        max_ip = max(ip_values) * 100

        # Maksimum 12 basamak, gereksiz sıfırlar olmadan
        formatted = f"{max_ip:.12f}".rstrip('0').rstrip('.')
        return f"{formatted}%"

    except Exception:
        return "0.0%"

def details(request, asteroid_id: int):
    url = f"https://api.nasa.gov/neo/rest/v1/neo/{asteroid_id}?api_key={settings.NASA_API_KEY}"
    r = requests.get(url)
    data = r.json()
    print(url)

    # Asteroid bilgilerini filtrele
    asteroid_info = {
        "id": data["id"],
        "name": data["designation"], 
        "eyes_on_url": f"https://eyes.nasa.gov/apps/asteroids/#/{name_3d(data['name'])}",
        "jpl_url": data["nasa_jpl_url"],
        "is_hazardous": data["is_potentially_hazardous_asteroid"],
        "abs_magnitude": data["absolute_magnitude_h"],
        "diameter_min": f"{float(data['estimated_diameter']['meters']['estimated_diameter_min']):.2f}",
        "diameter_max": f"{float(data['estimated_diameter']['meters']['estimated_diameter_max']):.2f}",
        "first_observation_date": data["orbital_data"]["first_observation_date"],
        "last_observation_date": data["orbital_data"]["last_observation_date"],
        "orbital_period": f"{float(data['orbital_data']['orbital_period']):.2f}",
        "mean_motion": f"{float(data['orbital_data']['mean_motion']):.2f}",
        "close_approaches": [
            {
                "date": ca["close_approach_date_full"],
                "velocity_kph": f"{float(ca['relative_velocity']['kilometers_per_hour']):.2f}",
                "distance_km": f"{float(ca['miss_distance']['kilometers']):.2f}",
                "orbiting_body": ca["orbiting_body"]
            }
            for ca in data["close_approach_data"]
        ],
        "observed_by_nasa": not data["is_sentry_object"],
        "orbit_class": data["orbital_data"]["orbit_class"]["orbit_class_description"]
    }

    # Dünya’ya en yakın yaklaşımı bul
    earth_approaches = [
        ca for ca in asteroid_info["close_approaches"] if ca["orbiting_body"].lower() == "earth"
    ]
    closest_approach = None
    if earth_approaches:
        closest_approach = min(
            earth_approaches,
            key=lambda x: float(x["distance_km"])
        )
        # Hız bilgisi zaten burada var
        closest_distance = closest_approach["distance_km"]
        closest_velocity = closest_approach["velocity_kph"]

    impact_probability = get_impact_probability(data["designation"].replace(" ", "%20"))

    speed_comparison = asteroid_speed_compare(closest_velocity, closest_distance)


    return render(
        request,
        "asteroid_detail.html",
        {
            "asteroid": asteroid_info,
            "impact_probability": impact_probability,
            "closest_approach": closest_approach,
            "speed_comparison_plane": speed_comparison["times_plane"],
            "speed_comparison_bullet": speed_comparison["times_bullet"],
            "speed_comparison_f1": speed_comparison["times_f1"],
            "rotate_count": speed_comparison["rotate_count"],
            "earth_to_moon_count": speed_comparison["earth_to_moon_count"],
            "asia_count": speed_comparison["asia_count"]
        }
    )


def game(request):
    """Render the standalone game page (game.html)."""
    return render(request, "game.html")


def simulator(request):
    """Render the meteor impact simulator page."""
    return render(request, "simulator.html")


def chat_api(request):
    print("Chat API called")
    if request.method != 'POST':
        return HttpResponseBadRequest('Only POST allowed')
    try:
        payload = json.loads(request.body)
        asteroid_info = payload.get('asteroid', {})
        message = payload.get('message', '').strip()
        print(message)
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    if not message:
        return JsonResponse({'error': 'empty message'}, status=400)

    try:
        reply_text = gemini_api(message, asteroid_info)
    except Exception as e:
        return JsonResponse({'error': f'Backend error'}, status=500)
    return JsonResponse({'reply': reply_text})


def gemini_api(message, asteroid_info):
    api_key = settings.GEMINI_API_KEY

    client = genai.Client()

    try:
        asteroid_info_str = ", ".join(f"{k}: {v}" for k, v in asteroid_info.items())

        chat_session = client.chats.create(
            model="gemini-2.5-flash",
            history=[]
        )
        gemini_response = chat_session.send_message(f"{asteroid_info_str} (Çap değerleri metre cinsinden, büyüklük H cinsinden, hız km / saat cinsinden, uzaklık km cisinden, period gün cinsinden, meanMotion derece/gün cinsinden) buradaki asteroid bilgilerine göre bu soruya cevap ver: {message} soruyu önce NASA'dan  aldığın bilgilerle cevapla sonra kendi bilginle destekle eğer sana alakasız bir soru sorarsa buna cevap veremiyorum de. sana sorulan sorulara Türkçe cevap ver ve cevaplarını çok uzatmadan tek paragraf halinde yaz.")
        gemini_reply = gemini_response.text

        print(gemini_reply)

    except Exception as e:
        return f"Yapay zeka servisi hatası"
    
    return gemini_reply