#!/usr/bin/env python3
"""
Skripta za ekstrakcijo podatkov PM2.5 iz PDF datotek v formatu ARSO.
Lahko obdela eno ali več PDF datotek istega formata.
"""

import json
import re
import sys
import argparse
from datetime import datetime
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Napaka: pdfplumber ni nameščen. Namesti z: pip install pdfplumber")
    exit(1)


def parse_date(date_str):
    """Pretvori datum iz formata '01.01.13' v ISO format '2013-01-01'"""
    try:
        # Format: DD.MM.YY
        parts = date_str.strip().split('.')
        if len(parts) == 3:
            day = int(parts[0])
            month = int(parts[1])
            year = int(parts[2])
            # Predpostavimo 20XX za leta < 50, drugače 19XX
            if year < 50:
                year = 2000 + year
            else:
                year = 1900 + year
            return f"{year}-{month:02d}-{day:02d}"
    except:
        pass
    return None


def parse_value(value_str):
    """Pretvori vrednost v število, če je '-' vrni None"""
    if value_str == '-' or value_str.strip() == '':
        return None
    try:
        return float(value_str.strip())
    except:
        return None


def extract_pm25_data(pdf_path, locations=None):
    """Ekstrahira podatke PM2.5 iz PDF datoteke"""

    if locations is None:
        locations = [
            "Ljubljana Biotehniška fakulteta",
            "Maribor center",
            "Maribor Vrbanski plato",
            "Iskrba"
        ]

    all_data = []
    location_data = {loc: [] for loc in locations}

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            # Vedno uporabi ekstrakcijo iz besedila, ker so tabele v PDF-ju slabo strukturirane
            text = page.extract_text()
            if text:
                extract_from_text(text, locations, all_data, location_data, page_num)

    return all_data, location_data


def extract_from_text(text, locations, all_data, location_data, page_num=0):
    """Ekstrahira podatke iz besedila PDF-ja"""
    lines = text.split('\n')

    # Poišči vrstice z datumi in vrednostmi
    # Format: DD.MM.YY vrednost1 vrednost2 vrednost3 ...
    for line in lines:
        # Poišči vrstice, ki se začnejo z datumom
        date_match = re.match(r'(\d{1,2})\.(\d{1,2})\s*\.(\d{2})', line.strip())
        if date_match:
            date_iso = parse_date(date_match.group(0).replace(' ', ''))
            if not date_iso:
                continue

            # Razdeli vrstico na dele (datum + vrednosti)
            # Format: "01.01.13 46 41 72 62 40 50 77 59 79 15 81 64 60 42 60"
            parts = line.strip().split()
            if len(parts) < 2:
                continue

            # Prvi del je datum, ostali so vrednosti
            values = parts[1:]

            # Obdelaj vrednosti za vsako lokacijo
            num_locations = min(len(locations), len(values))
            for i in range(num_locations):
                value_str = values[i] if i < len(values) else None
                if value_str:
                    value = parse_value(value_str)
                    if value is not None:
                        location = locations[i]
                        measurement = {
                            "date": date_iso,
                            "location": location,
                            "value": value,
                            "unit": "μg/m³",
                            "aggregation": "daily_average"
                        }
                        all_data.append(measurement)
                        if location in location_data:
                            location_data[location].append(measurement)


def detect_year_from_data(all_data):
    """Določi leto iz podatkov (prvi datum)"""
    if not all_data:
        return None

    # Poišči prvi datum
    dates = [m["date"] for m in all_data if m.get("date")]
    if dates:
        first_date = min(dates)
        year = int(first_date.split("-")[0])
        return year
    return None


def detect_year_from_filename(filename):
    """Poskusi določiti leto iz imena datoteke"""
    # Iskanje 4-mestnega leta v imenu datoteke
    year_match = re.search(r'20\d{2}|19\d{2}', str(filename))
    if year_match:
        return int(year_match.group(0))

    # Iskanje 2-mestnega leta (npr. 13, 14)
    year_match = re.search(r'(\d{2})slo', str(filename))
    if year_match:
        year_short = int(year_match.group(1))
        if year_short < 50:
            return 2000 + year_short
        else:
            return 1900 + year_short

    return None


def save_json_files(all_data, location_data, output_dir, source_file, year=None):
    """Shrani podatke v JSON datoteke"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Določi leto, če ni podano
    if year is None:
        year = detect_year_from_data(all_data)
        if year is None:
            year = detect_year_from_filename(source_file)
        if year is None:
            year = "unknown"

    # Ustvari ime datoteke iz imena vira
    source_name = Path(source_file).stem

    # Shrani vse podatke v eno datoteko
    all_data_file = output_path / f"PM25_{year}_all_{source_name}.json"
    with open(all_data_file, 'w', encoding='utf-8') as f:
        json.dump({
            "source": str(source_file),
            "pollutant": "PM2.5",
            "year": year,
            "total_measurements": len(all_data),
            "data": all_data
        }, f, ensure_ascii=False, indent=2)

    print(f"Shranjeno: {all_data_file} ({len(all_data)} meritev)")

    # Shrani podatke po lokacijah
    location_dir = output_path / f"po_lokacijah_{year}"
    location_dir.mkdir(exist_ok=True)

    for location, data in location_data.items():
        if len(data) > 0:
            # Ustvari varno ime datoteke
            safe_name = location.replace(" ", "_").replace("/", "_").replace(".", "")
            location_file = location_dir / f"{safe_name}.json"

            # Preveri, ali datoteka že obstaja (za združevanje podatkov iz več PDF-jev)
            existing_data = []
            if location_file.exists():
                with open(location_file, 'r', encoding='utf-8') as f:
                    existing_json = json.load(f)
                    existing_data = existing_json.get("data", [])

            # Združi podatke
            combined_data = existing_data + data
            # Odstrani duplikate (po datumu in lokaciji)
            seen = set()
            unique_data = []
            for item in combined_data:
                key = (item["date"], item["location"])
                if key not in seen:
                    seen.add(key)
                    unique_data.append(item)

            with open(location_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "location": location,
                    "pollutant": "PM2.5",
                    "year": year,
                    "total_measurements": len(unique_data),
                    "data": sorted(unique_data, key=lambda x: x["date"])
                }, f, ensure_ascii=False, indent=2)

            print(f"Shranjeno: {location_file} ({len(unique_data)} meritev)")


def process_pdf_file(pdf_path, output_base_dir):
    """Obdela eno PDF datoteko"""
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        print(f"Opozorilo: Datoteka {pdf_path} ne obstaja!")
        return False

    print(f"\n{'='*60}")
    print(f"Ekstrahiranje podatkov iz {pdf_path.name}...")
    print(f"{'='*60}")

    all_data, location_data = extract_pm25_data(pdf_path)

    if len(all_data) == 0:
        print(f"Opozorilo: Ni bilo najdenih podatkov v {pdf_path.name}!")
        return False

    # Določi leto
    year = detect_year_from_data(all_data)
    if year is None:
        year = detect_year_from_filename(pdf_path)

    print(f"\nNajdeno {len(all_data)} meritev")
    print(f"Lokacije: {len([loc for loc, data in location_data.items() if len(data) > 0])}")
    if year:
        print(f"Leto: {year}")

    # Shrani podatke
    if year:
        output_dir = Path(output_base_dir) / f"PM25_{year}"
    else:
        output_dir = Path(output_base_dir) / "PM25_unknown"

    save_json_files(all_data, location_data, output_dir, pdf_path, year)

    return True


def find_pdf_files(directory, pattern=None):
    """Poišče vse PDF datoteke v mapi"""
    directory = Path(directory)
    if pattern:
        pdf_files = list(directory.glob(pattern))
    else:
        pdf_files = list(directory.glob("*.pdf"))

    return sorted(pdf_files)


def main():
    parser = argparse.ArgumentParser(
        description="Ekstrahira podatke PM2.5 iz PDF datotek v formatu ARSO"
    )
    parser.add_argument(
        "pdf_files",
        nargs="*",
        help="PDF datoteke za obdelavo (če ni podano, poišče vse PDF datoteke v trenutni mapi)"
    )
    parser.add_argument(
        "-d", "--directory",
        default=".",
        help="Mapa za iskanje PDF datotek (privzeto: trenutna mapa)"
    )
    parser.add_argument(
        "-p", "--pattern",
        help="Vzorec za iskanje PDF datotek (npr. 'PM25_*.pdf')"
    )
    parser.add_argument(
        "-o", "--output",
        default="data/ARSO",
        help="Izhodna mapa za JSON datoteke (privzeto: data/ARSO)"
    )

    args = parser.parse_args()

    # Določi PDF datoteke za obdelavo
    if args.pdf_files:
        pdf_files = [Path(f) for f in args.pdf_files]
    else:
        pdf_files = find_pdf_files(args.directory, args.pattern)

    if not pdf_files:
        print("Napaka: Ni najdenih PDF datotek za obdelavo!")
        print(f"Iskano v: {Path(args.directory).absolute()}")
        if args.pattern:
            print(f"Vzorec: {args.pattern}")
        return

    print(f"Najdeno {len(pdf_files)} PDF datotek za obdelavo:")
    for pdf_file in pdf_files:
        print(f"  - {pdf_file}")

    # Obdela vsako datoteko
    successful = 0
    failed = 0

    for pdf_file in pdf_files:
        try:
            if process_pdf_file(pdf_file, args.output):
                successful += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\nNapaka pri obdelavi {pdf_file.name}: {e}")
            failed += 1

    print(f"\n{'='*60}")
    print(f"Končano!")
    print(f"Uspešno obdelano: {successful}")
    print(f"Neuspešno: {failed}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
