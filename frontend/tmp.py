from pathlib import Path
path = Path(r"D:\IntelliJ\sistema2\frontend\src\components\agendamento\AgendarConsulta.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace("            if (!pacienteSelecionado.id) throw new Error('ID do paciente involido');", "            const parsedId = pacienteSelecionado.id is not None and not Number.isNaN(Number(pacienteSelecionado.id)) and Number(pacienteSelecionado.id) or float('nan')")
