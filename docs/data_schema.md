## Table `alerts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `patient_id` | `uuid` |  Nullable |
| `severity` | `varchar` |  Nullable |
| `alert_message` | `text` |  Nullable |
| `status` | `varchar` |  Nullable |
| `resolved_by` | `uuid` |  Nullable |
| `triggered_at` | `timestamp` |  Nullable |

## Table `health_records`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `patient_id` | `uuid` |  Nullable |
| `systolic_bp` | `float8` |  Nullable |
| `diastolic_bp` | `float8` |  Nullable |
| `hemoglobin` | `float8` |  Nullable |
| `blood_sugar` | `float8` |  Nullable |
| `heart_rate` | `float8` |  Nullable |
| `body_temperature` | `float8` |  Nullable |
| `weight` | `float8` |  Nullable |
| `symptoms` | `text` |  Nullable |
| `source_type` | `varchar` |  Nullable |
| `recorded_at` | `timestamp` |  Nullable |
| `updated_at` | `timestamp` |  Nullable |
| `bmi` | `float8` |  Nullable |
| `meals_per_day` | `int4` |  Nullable |
| `veg_freq` | `int4` |  Nullable |

## Table `healthcare_embeddings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `content` | `text` |  Nullable |
| `source` | `varchar` |  Nullable |
| `embedding` | `vector` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `nutrition_recommendations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `patient_id` | `uuid` |  Nullable |
| `recommendation` | `text` |  Nullable |
| `language` | `varchar` |  Nullable |
| `generated_at` | `timestamp` |  Nullable |

## Table `ocr_reports`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `patient_id` | `uuid` |  Nullable |
| `report_url` | `text` |  Nullable |
| `extracted_text` | `text` |  Nullable |
| `parsed_json` | `jsonb` |  Nullable |
| `uploaded_at` | `timestamp` |  Nullable |

## Table `patients`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `patient_code` | `varchar` |  Nullable Unique |
| `full_name` | `varchar` |  Nullable |
| `age` | `int4` |  Nullable |
| `trimester` | `int4` |  Nullable |
| `pregnancy_week` | `int4` |  Nullable |
| `village` | `varchar` |  Nullable |
| `latitude` | `float8` |  Nullable |
| `longitude` | `float8` |  Nullable |
| `blood_group` | `varchar` |  Nullable |
| `contact_number` | `varchar` |  Nullable |
| `emergency_contact` | `varchar` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `updated_at` | `timestamp` |  Nullable |
| `is_deleted` | `bool` |  Nullable |
| `height_cm` | `float8` |  Nullable |

## Table `predictions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `patient_id` | `uuid` |  Nullable |
| `anemia_risk` | `varchar` |  Nullable |
| `hypertension_risk` | `varchar` |  Nullable |
| `overall_risk` | `varchar` |  Nullable |
| `confidence_score` | `float8` |  Nullable |
| `model_version` | `varchar` |  Nullable |
| `ai_summary` | `text` |  Nullable |
| `recommendation` | `text` |  Nullable |
| `predicted_at` | `timestamp` |  Nullable |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `varchar` |  Nullable |
| `email` | `varchar` |  Nullable Unique |
| `password_hash` | `text` |  Nullable |
| `role` | `varchar` |  Nullable |
| `phone` | `varchar` |  Nullable |
| `village` | `varchar` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `updated_at` | `timestamp` |  Nullable |
| `is_deleted` | `bool` |  Nullable |

## Table `village_analytics`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `village_name` | `varchar` |  Nullable |
| `high_risk_cases` | `int4` |  Nullable |
| `medium_risk_cases` | `int4` |  Nullable |
| `low_risk_cases` | `int4` |  Nullable |
| `anemia_cases` | `int4` |  Nullable |
| `hypertension_cases` | `int4` |  Nullable |
| `updated_at` | `timestamp` |  Nullable |

