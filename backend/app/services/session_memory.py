last_patient = None


def set_last_patient(patient):
    global last_patient
    last_patient = patient


def get_last_patient():
    return last_patient