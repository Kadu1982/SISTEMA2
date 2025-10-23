#!/usr/bin/env python3
"""
Test script to verify SADT system works after fixing the agendamento_id column issue
"""
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8080/api"

def test_sadt_endpoint_after_fix():
    """Test the SADT endpoint that was causing the JDBC error"""
    
    print("🔍 Testing SADT system after database fix...")
    print("🎯 Target: Fix for JDBC error 'coluna s1_0.agendamento_id não existe'")
    
    # Test the endpoint that was failing
    test_endpoints = [
        f"{BASE_URL}/agendamentos/39/comprovante",
        f"{BASE_URL}/sadt/agendamentos/39/pdf"
    ]
    
    for endpoint in test_endpoints:
        print(f"\n📋 Testing endpoint: {endpoint}")
        
        try:
            response = requests.get(endpoint, headers={
                "Accept": "application/pdf"
            }, timeout=10)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                content_type = response.headers.get('Content-Type', '')
                if 'application/pdf' in content_type:
                    print("✅ SUCCESS: PDF document retrieved successfully!")
                    print(f"📄 Document size: {len(response.content)} bytes")
                    
                    # Check document type
                    content_disposition = response.headers.get('Content-Disposition', '')
                    if 'sadt-' in content_disposition.lower():
                        print("🧪 Document type: SADT (Lab/Imaging exam)")
                    elif 'comprovante-' in content_disposition.lower():
                        print("🏥 Document type: Voucher (Consultation)")
                    else:
                        print(f"📄 Content-Disposition: {content_disposition}")
                else:
                    print(f"⚠️ Unexpected content type: {content_type}")
                    if response.text:
                        print(f"Response body preview: {response.text[:200]}...")
                        
            elif response.status_code == 404:
                error_msg = response.text
                print(f"📝 Resource not found: {error_msg[:100]}...")
                if "agendamento_id" in error_msg.lower():
                    print("❌ STILL FAILING: agendamento_id issue persists")
                elif "nenhuma sadt encontrada" in error_msg.lower():
                    print("✅ SCHEMA FIXED: No more column errors, just missing SADT data")
                elif "agendamento não encontrado" in error_msg:
                    print("✅ SCHEMA FIXED: Appointment doesn't exist but no column errors")
                    
            elif response.status_code == 500:
                error_msg = response.text
                print(f"❌ Server error: {error_msg[:200]}...")
                if "agendamento_id não existe" in error_msg:
                    print("🔧 MIGRATION NEEDED: Column still missing, migration may not have run")
                else:
                    print("⚠️ Different server error - may be unrelated to column issue")
                    
            else:
                print(f"⚠️ Unexpected status: {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend - server may not be running")
            return False
        except requests.exceptions.Timeout:
            print("⏱️ Request timed out - server may be starting up")
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False
    
    return True

def test_sadt_generation():
    """Test SADT generation endpoint"""
    print(f"\n🧪 Testing SADT generation endpoint...")
    
    # Sample SADT generation request
    sadt_request = {
        "agendamentoId": 39,
        "pacienteId": 1,
        "procedimentos": [
            {
                "codigo": "0202020380",
                "nome": "Hemograma Completo",
                "quantidade": 1
            }
        ],
        "observacoes": "Exame laboratorial de rotina"
    }
    
    try:
        url = f"{BASE_URL}/sadt/gerar"
        response = requests.post(url, 
                               json=sadt_request,
                               headers={"Content-Type": "application/json"},
                               timeout=15)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('sucesso'):
                print("✅ SUCCESS: SADT generated successfully!")
                print(f"📄 SADT Number: {result.get('numeroSadt', 'N/A')}")
            else:
                print(f"❌ SADT generation failed: {result.get('mensagem', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            if response.text:
                print(f"Error details: {response.text[:300]}...")
                
    except Exception as e:
        print(f"❌ Error testing SADT generation: {e}")

if __name__ == "__main__":
    print("🚀 Starting SADT system test after database fix...\n")
    
    # Test the main functionality
    test_sadt_endpoint_after_fix()
    
    # Test SADT generation
    test_sadt_generation()
    
    print(f"\n✅ Test completed!")
    print("📝 Summary:")
    print("   - If you see 'SCHEMA FIXED' messages, the agendamento_id column issue is resolved")
    print("   - If you see 'STILL FAILING' or 'MIGRATION NEEDED', the database needs more work")
    print("   - Connection errors mean the server needs to be started to apply migrations")