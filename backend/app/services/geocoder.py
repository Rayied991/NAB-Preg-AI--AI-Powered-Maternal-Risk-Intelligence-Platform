import requests


def get_coordinates(place_name: str):

    try:

        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": f"{place_name}, Bangladesh",
                "format": "json",
                "limit": 1,
            },
            headers={
                "User-Agent": "NABPregAI"
            },
            timeout=5,
        )

        data = response.json()

        if not data:
            return None

        return {
            "latitude": float(data[0]["lat"]),
            "longitude": float(data[0]["lon"]),
        }

    except Exception as e:

        print("GEOCODER ERROR:", e)

        return None