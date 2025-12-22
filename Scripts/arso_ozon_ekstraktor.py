#!/usr/bin/env python3
"""
Skripta za ekstrakcijo podatkov Ozone iz PDF datotek v formatu ARSO.
Lahko obdela eno ali več PDF datotek istega formata.
"""

import json
import re
import argparse
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
    """Pretvori vrednost v število, če je '-' ali '/' ali '' vrni None"""
    if value_str == '-' or value_str == '/' or value_str.strip() == '':
        return None
    try:
        value_str = value_str.replace('*', '')
        return float(value_str.strip())
    except:
        return None


def extract_Ozone_data(pdf_path, locations=None):
    """Ekstrahira podatke Ozona iz PDF datoteke"""
    
    LOCATION_ALIASES = {
        "MB Vrbanski plato": "Maribor Vrbanski plato",
        "MB Vrbanski": "Maribor Vrbanski plato",
        "LJ Bežigrad": "Ljubljana Bežigrad",
        "CE bolnica": "Celje",
        "MS Rakičan": "Murska Sobota",
        "NG Grčna": "Nova Gorica",
    }

    if locations is None:
        locations = [
            "Ljubljana Bežigrad",
            "Maribor Vrbanski plato",
            "Celje",
            "Murska Sobota",
            "Nova Gorica",
            "Koper",
            "Trbovlje",
            "Zagorje",
            "Hrastnik",
            "Novo mesto",
            "Iskrba",
            "Otlica",
            "Krvavec",
        ]
    
    alias_map = {}
    for loc in locations:
        alias_map[loc] = loc
    for alias, canonical in LOCATION_ALIASES.items():
        alias_map[alias] = canonical

    # canonical set for storing results
    canonical_locations = sorted(set(alias_map.values()))
    all_data = []
    location_data = {loc: [] for loc in canonical_locations}
    
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            # Vedno uporabi ekstrakcijo iz besedila, ker so tabele v PDF-ju slabo strukturirane
            text = page.extract_text()
            if text:
                extract_from_text(text, list(alias_map.keys()), alias_map, all_data, location_data, page_num)
    
    return all_data, location_data


def extract_from_text(text, locations, alias_map,all_data, location_data, page_num=0):
    """Ekstrahira podatke iz besedila PDF-ja"""
    lines = text.split('\n')
    details = "Concentration > 180 μg/m³"
    # Poišči vrstice z imeni lokacij in vrednostmi
    for line in lines:
        line = line.strip()
        
        if (line.startswith("Preglednica 2")):
            details = "Concentration > 120 μg/m³ for at least 8 hours"

        # Poišči vrstice, ki se začnejo z lokacijo
        matched_alias = None
        for loc in locations:
            if line == loc or line.startswith(loc):
                matched_alias = loc
                break
        
        if matched_alias is None:
            continue

        canonical = alias_map.get(matched_alias, matched_alias)
        rest = line[len(matched_alias):].strip()

        if rest.startswith('*'):
            rest = rest[1:].strip()

        if rest.startswith(':'):
            continue

        parts = rest.split()

        if len(parts) < 12:
            continue  # Pričakujemo vsaj 12 vrednosti
        
        for month_index in range(12):
            value_str = parts[month_index]
            value = parse_value(value_str)
            if value is not None:
                measurement = {
                    "month": month_index,
                    "location": canonical,
                    "value": value,
                    "unit": "μg/m³",
                    "detail": details,
                }
                all_data.append(measurement)
                location_data[canonical].append(measurement)


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
    all_data_file = output_path / f"Ozone_{year}_all_{source_name}.json"
    with open(all_data_file, 'w', encoding='utf-8') as f:
        json.dump({
            "source": str(source_file),
            "pollutant": "Ozone",
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
            safe_name = location.replace(" ", "_").replace("/", "_")
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
                key = (item["month"], item["location"], item["detail"])
                if key not in seen:
                    seen.add(key)
                    unique_data.append(item)
            
            with open(location_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "location": location,
                    "pollutant": "Ozone",
                    "year": year,
                    "total_measurements": len(unique_data),
                    "data": sorted(unique_data, key=lambda x: x["month"])
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
    
    all_data, location_data = extract_Ozone_data(pdf_path)
    
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
        output_dir = Path(output_base_dir) / f"Ozone_{year}"
    else:
        output_dir = Path(output_base_dir) / "Ozone_unknown"
    
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
        description="Ekstrahira podatke Ozone iz PDF datotek v formatu ARSO"
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
        help="Vzorec za iskanje PDF datotek (npr. 'Ozone_*.pdf')"
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

