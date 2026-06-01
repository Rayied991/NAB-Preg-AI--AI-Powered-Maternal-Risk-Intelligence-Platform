export async function fetchAnalytics(){
    const response=await fetch(
        "http://127.0.0.1:8000/api/analytics"
    );

    if(!response.ok){
        throw new Error(
            "Failed to fetch analytics"
        );
    }

    return response.json();
}