from .graph import clinical_graph


def run_clinical_graph(
    question,
    patient_context
):

    result = clinical_graph.invoke(
        {
            "question": question,
            "patient_context": patient_context,
        }
    )

    return result["final_answer"]