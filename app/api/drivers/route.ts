import { NextResponse } from "next/server";  
  
export async function GET() {  
  return NextResponse.json({  
    sucesso: true,  
    dados: [  
      ["deal date", "weekend", "hub", "analyst", "driver", "status", "modal", "driver id", "telefone", "data treinamento"],  
      ["2026-07-01", "W27", "HUB A", "Leandro", "João Silva", "Ativo", "Moto", "123", "11999999999", "2026-07-01"],  
      ["2026-07-01", "W27", "HUB B", "Leandro", "Maria Souza", "Pendente", "Van", "456", "11988888888", ""]  
    ]  
  });  
}