import { API_URL } from "@/lib/config";
export async function fetchAnalytics(){
    const response=await fetch(
        `${API_URL}/api/analytics`
    );

    if(!response.ok){
        throw new Error(
            "Failed to fetch analytics"
        );
    }

    return response.json();
}