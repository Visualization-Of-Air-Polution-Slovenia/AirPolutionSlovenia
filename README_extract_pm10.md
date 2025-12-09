# Ekstrakcija podatkov PM10 iz PDF

Ta skripta ekstrahira podatke o koncentracijah PM10 iz PDF datotek v formatu ARSO. Lahko obdela eno ali več PDF datotek istega formata.

## Namestitev

Namesti potrebne odvisnosti:

```bash
pip install -r requirements.txt
```

ali

```bash
pip install pdfplumber
```

## Uporaba

### Obdelava ene datoteke

```bash
python extract_pm10_pdf.py PM10_D_dec13slo.pdf
```

### Obdelava več datotek

```bash
python extract_pm10_pdf.py PM10_D_dec13slo.pdf PM10_D_dec14slo.pdf PM10_D_dec15slo.pdf
```

### Samodejno iskanje vseh PDF datotek v mapi

```bash
python extract_pm10_pdf.py
```

To bo poiskalo vse PDF datoteke v trenutni mapi in jih obdelalo.

### Iskanje z vzorcem

```bash
python extract_pm10_pdf.py -p "PM10_*.pdf"
```

### Določitev mape za iskanje

```bash
python extract_pm10_pdf.py -d /path/to/pdf/files
```

### Določitev izhodne mape

```bash
python extract_pm10_pdf.py -o data/ARSO PM10_D_dec13slo.pdf
```

### Vsi parametri

```bash
python extract_pm10_pdf.py -d . -p "PM10_*.pdf" -o data/ARSO
```

## Parametri

- `pdf_files` - Seznam PDF datotek za obdelavo (opcijsko, če ni podano, poišče vse PDF datoteke)
- `-d, --directory` - Mapa za iskanje PDF datotek (privzeto: trenutna mapa)
- `-p, --pattern` - Vzorec za iskanje PDF datotek (npr. 'PM10_*.pdf')
- `-o, --output` - Izhodna mapa za JSON datoteke (privzeto: data/ARSO)

## Izhod

Skripta bo ustvarila JSON datoteke v mapi `data/ARSO/PM10_<leto>/`:

- `PM10_<leto>_all_<ime_datoteke>.json` - vse meritve iz posamezne datoteke
- `po_lokacijah_<leto>/` - mapa z datotekami za vsako lokacijo posebej:
  - `Ljubljana_Bežigrad.json`
  - `Ljubljana_BF.json`
  - `Maribor_center.json`
  - itd.

**Opomba:** Če obdelate več PDF datotek za isto leto, bodo podatki za posamezne lokacije avtomatično združeni (brez duplikatov).

## Format podatkov

Vsaka meritev vsebuje:
- `date`: datum v ISO formatu (npr. "2013-01-01")
- `location`: ime lokacije
- `value`: koncentracija PM10 v μg/m³
- `unit`: enota ("μg/m³")
- `aggregation`: tip agregacije ("daily_average")

## Primeri

### Obdelava vseh PDF datotek v trenutni mapi

```bash
python extract_pm10_pdf.py
```

### Obdelava specifičnih datotek

```bash
python extract_pm10_pdf.py PM10_D_dec13slo.pdf PM10_D_dec14slo.pdf
```

### Iskanje in obdelava vseh PM10 datotek

```bash
python extract_pm10_pdf.py -p "PM10_*.pdf" -o data/ARSO
```

