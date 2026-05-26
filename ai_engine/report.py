from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

def print_risk_report(result):

    console.print(
        Panel.fit(
            "[bold cyan]NAB PREG AI RISK REPORT[/bold cyan]"
        )
    )

    summary = Table(title="Patient Summary")

    summary.add_column("Metric", style="cyan")
    summary.add_column("Value", style="green")

    summary.add_row(
        "Overall Risk",
        result["patient_status"]["overall_risk"]
    )

    summary.add_row(
        "Anemia Risk",
        result["patient_status"]["anemia_risk"]
    )

    summary.add_row(
        "Hypertension Risk",
        result["patient_status"]["hypertension_risk"]
    )

    summary.add_row(
        "Confidence Score",
        f'{result["patient_status"]["confidence_score"]}%'
    )

    console.print(summary)

    findings = Table(title="Clinical Findings")

    findings.add_column("Severity", style="red")
    findings.add_column("Finding", style="white")

    for finding in result["clinical_findings"]:
        findings.add_row("HIGH", finding)

    console.print(findings)

    console.print("\n[bold yellow]AI Recommendations[/bold yellow]")

    for rec in result["ai_recommendations"]:
        console.print(f"• {rec}")