import pandas as pd
import os
import argparse
from pathlib import Path

''' This program converts all parquet files in a specified directory to JSON format. '''

# Parse command line arguments
parser = argparse.ArgumentParser(description='Convert parquet files to JSON')
parser.add_argument('parquet_dir', help='Directory containing parquet files')
parser.add_argument('output_dir', help='Directory to save JSON files')
args = parser.parse_args()

parquet_dir = args.parquet_dir
output_dir = args.output_dir

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Process all parquet files in the specified directory (not subdirectories)
for parquet_file in Path(parquet_dir).glob("*.parquet"):
    # Read parquet file
    df = pd.read_parquet(parquet_file)
    
    # Create output filename
    json_filename = parquet_file.stem + ".json"
    json_path = os.path.join(output_dir, json_filename)
    
    # Write to JSON with ISO timestamps for any datetime columns
    df.to_json(json_path, orient='records', indent=2, date_format='iso')
    print(f"Converted: {parquet_file.name} → {json_filename}")  