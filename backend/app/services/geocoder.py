import requests


def get_coordinates(place_name: str):
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
    )
    
    data =response.json()
    
    if not data:
        return None
    
    
    return{
        "latitude": float(data[0]["lat"]),
        "longitude": float(data[0]["lon"])
    }