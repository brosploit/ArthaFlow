import io


def test_csv_upload_and_parsing_success(client, auth_headers):
    csv_data = """Date,Description,Amount,Type,Category,Counterparty
2024-10-31,Store Retail Sales,32500,income,Sales,Walk-in Customers
2024-10-30,Freight Logistics,14200,expense,Logistics,Delhivery Surface
2024-10-29,B2B Settlement,45000,income,Wholesale,FabIndia
2024-10-28,Commercial Lease Rent,22000,expense,Rent,Sharma Estates
2024-10-27,Fabric Lot Sourcing,18500,expense,Raw Materials,Surat Cotton Mills
"""
    file_bytes = io.BytesIO(csv_data.encode("utf-8"))
    res = client.post(
        "/api/v1/transactions/import",
        headers=auth_headers,
        files={"file": ("statement.csv", file_bytes, "text/csv")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 5
    assert data["imported_count"] == 5
    assert data["duplicate_count"] == 0
    assert len(data["detected_categories"]) >= 3


def test_csv_duplicate_detection(client, auth_headers):
    # Uploading the exact same CSV twice should detect duplicates
    csv_data = """Date,Description,Amount,Type,Category,Counterparty
2024-10-25,Single Transaction,1000,expense,Test,Vendor A
"""
    file_bytes = io.BytesIO(csv_data.encode("utf-8"))
    res1 = client.post(
        "/api/v1/transactions/import",
        headers=auth_headers,
        files={"file": ("batch1.csv", file_bytes, "text/csv")},
    )
    assert res1.json()["imported_count"] == 1

    file_bytes_2 = io.BytesIO(csv_data.encode("utf-8"))
    res2 = client.post(
        "/api/v1/transactions/import",
        headers=auth_headers,
        files={"file": ("batch2.csv", file_bytes_2, "text/csv")},
    )
    assert res2.json()["imported_count"] == 0
    assert res2.json()["duplicate_count"] == 1


def test_csv_graceful_malformed_rows(client, auth_headers):
    # Contains valid rows and one bad date and one bad amount
    csv_data = """Date,Description,Amount,Type
2024-10-20,Valid Row 1,500,expense
INVALID_DATE,Bad Date Row,1200,expense
2024-10-22,Bad Amount Row,NOT_A_NUMBER,income
2024-10-23,Valid Row 2,1500,income
"""
    file_bytes = io.BytesIO(csv_data.encode("utf-8"))
    res = client.post(
        "/api/v1/transactions/import",
        headers=auth_headers,
        files={"file": ("mixed.csv", file_bytes, "text/csv")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["imported_count"] == 2
    assert data["skipped_count"] == 2
    assert len(data["validation_errors"]) == 2
