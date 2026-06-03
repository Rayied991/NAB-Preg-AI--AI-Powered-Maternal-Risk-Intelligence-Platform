from langchain_mistralai import (
    ChatMistralAI
)

llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)


def generate_patient_summary(
    patient
):

    prompt = f"""
You are a maternal healthcare specialist.

Patient Details:

Name: {patient.get('full_name')}
Age: {patient.get('age')}
Trimester: {patient.get('trimester')}
Pregnancy Week: {patient.get('pregnancy_week')}
Blood Group: {patient.get('blood_group')}

If trimester and pregnancy week appear inconsistent,
mention that in the assessment.

Provide:

1. Clinical Summary
2. Key Concerns
3. Recommendations

Keep response concise.
"""

    response = llm.invoke(
        prompt
    )

    return response.content