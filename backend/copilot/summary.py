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

    Return plain text only.

    Do NOT use markdown.
    Do NOT use ** or bullet symbols.

    Patient Details:

    Name: {patient.get('full_name')}
    Age: {patient.get('age')}
    Trimester: {patient.get('trimester')}
    Pregnancy Week: {patient.get('pregnancy_week')}
    Blood Group: {patient.get('blood_group')}

    Provide:

    Clinical Summary
    Key Concerns
    Recommendations

    Keep response concise.
    """

    response = llm.invoke(
        prompt
    )

    return response.content