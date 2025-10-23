#!/usr/bin/env python3
"""
Test script to verify SADT generation and retrieval workflow
"""
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8080/api"

def test_appointment_document_workflow():
    """Test the appointment document retrieval endpoint"""
    
    print("🔍 Testing SADT document workflow...")
    
    # Try to get a document for an existing appointment
    # Using appointment ID 39 as seen in the browser console error from the issue
    appointment_id = 39
    
    try:
        url = f"{BASE_URL}/agendamentos/{appointment_id}/comprovante"
        print(f"📋 Testing endpoint: {url}")
        
        response = requests.get(url, headers={
            "Accept": "application/pdf"
        })
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                print("✅ PDF document retrieved successfully!")
                print(f"📄 Document size: {len(response.content)} bytes")
                
                # Check the filename to see if it's SADT or voucher
                content_disposition = response.headers.get('Content-Disposition', '')
                if 'sadt-' in content_disposition.lower():
                    print("🧪 Document type: SADT (Lab/Imaging exam)")
                elif 'comprovante-' in content_disposition.lower():
                    print("🏥 Document type: Voucher (Consultation)")
                else:
                    print(f"📄 Content-Disposition: {content_disposition}")
                    
            else:
                print(f"⚠️ Unexpected content type: {content_type}")
                print(f"Response body: {response.text[:500]}")
                
        elif response.status_code == 404:
            error_msg = response.text
            print(f"❌ Document not found: {error_msg}")
            if "Nenhuma SADT encontrada" in error_msg:
                print("🔧 Issue confirmed: SADT documents are not being generated for exam appointments")
            elif "Agendamento não encontrado" in error_msg:
                print(f"📝 Appointment {appointment_id} does not exist")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the backend server. Make sure it's running on localhost:8080")
        return False
    except Exception as e:
        print(f"❌ Error testing workflow: {e}")
        return False
    
    return True

def test_multiple_appointments():
    """Test multiple appointment IDs to see the pattern"""
    print("\n🔍 Testing multiple appointments...")
    
    # Test different appointment IDs
    test_ids = [35, 36, 37, 38, 39, 40, 41, 42]
    
    for appointment_id in test_ids:
        try:
            url = f"{BASE_URL}/agendamentos/{appointment_id}/comprovante"
            response = requests.get(url, headers={"Accept": "application/pdf"})
            
            if response.status_code == 200:
                content_disposition = response.headers.get('Content-Disposition', '')
                doc_type = "SADT" if 'sadt-' in content_disposition.lower() else "Voucher"
                print(f"✅ Appointment {appointment_id}: {doc_type} document found")
            elif response.status_code == 404:
                error_msg = response.text
                if "Nenhuma SADT encontrada" in error_msg:
                    print(f"🧪 Appointment {appointment_id}: Expected SADT but none found (exam appointment)")
                elif "Agendamento não encontrado" in error_msg:
                    print(f"📝 Appointment {appointment_id}: Does not exist")
                else:
                    print(f"❓ Appointment {appointment_id}: Unknown error - {error_msg[:100]}")
            else:
                print(f"⚠️ Appointment {appointment_id}: Status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection failed - server not running")
            break
        except Exception as e:
            print(f"❌ Error testing appointment {appointment_id}: {e}")

if __name__ == "__main__":
    print("🚀 Starting SADT workflow test...\n")
    
    # Test the main workflow
    test_appointment_document_workflow()
    
    # Test multiple appointments to see the pattern
    test_multiple_appointments()
    
    print("\n✅ Test completed!")