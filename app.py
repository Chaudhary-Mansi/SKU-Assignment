from flask import Flask, render_template, request, send_file, jsonify
import pandas as pd
import os

app = Flask(__name__)

UPLOAD_FOLDER = "processed_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_files():
    sales_file = request.files.get("sales_file")
    price_file = request.files.get("price_file")

    if not sales_file or not price_file:
        return jsonify({"error": "Both files are required"}), 400

    sales_df = pd.read_excel(sales_file)
    price_df = pd.read_excel(price_file)

    increase_percent = {
        "A": 10, "B": 7.5, "C": 8, "D": 12
    }

    sales_df["Sales Forecast"] = sales_df.apply(
        lambda row: row["Last month sales"] * (1 + (increase_percent.get(row["SKUs"], 0) / 100)), axis=1
    )

    merged_df = sales_df.merge(price_df, on="SKUs")
    merged_df["Purchase Order"] = merged_df["Sales Forecast"] * merged_df["Price"]

    output_path = os.path.join(UPLOAD_FOLDER, "processed_data.xlsx")
    merged_df.to_excel(output_path, index=False)

    return jsonify({
        "data": merged_df.to_dict(orient="records"),
        "file_path": output_path
    })

@app.route("/download")
def download_file():
    file_path = os.path.join(UPLOAD_FOLDER, "processed_data.xlsx")
    return send_file(file_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
