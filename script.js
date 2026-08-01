console.log("Sistema São Jorge Gás carregado!");


// ===============================
// BANCO DE DADOS LOCAL
// ===============================

let contagem = JSON.parse(
    localStorage.getItem("contagemGas")
) || [];


let historico = JSON.parse(
    localStorage.getItem("historicoGas")
) || [];




// ===============================
// FUNÇÕES AUXILIARES
// ===============================


function dinheiro(valor){

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

}



function numero(valor){

    if(!valor) return 0;

    return Number(
        String(valor)
        .replace(/\./g,"")
        .replace(",",".")
    );

}




// ===============================
// TROCA DE TELAS
// ===============================


function mostrarTela(id){

    let telas = document.querySelectorAll(".tela");


    telas.forEach(tela=>{

        tela.classList.add("escondido");

    });



    let abrir = document.getElementById(id);


    if(abrir){

        abrir.classList.remove("escondido");

    }

}





// ===============================
// CALCULADORA NOTA FISCAL
// ===============================


function calcularNota(){


    let tipo = document.getElementById(
        "tipoGas"
    ).value;



    let valor = numero(
        document.getElementById(
            "valorNota"
        ).value
    );



    let tabela = Number(
        document.getElementById(
            "tabelaP13"
        ).value
    );



    if(valor <= 0){

        document.getElementById(
            "resultadoNota"
        ).innerHTML =
        "Digite um valor válido.";

        return;

    }




    let resultado;



    if(tipo === "P13"){


        resultado = calcularP13(
            valor,
            tabela
        );


    }



    if(tipo === "P20"){


        resultado = calcularProdutoFixo(
            valor,
            130,
            "P20"
        );


    }



    if(tipo === "P45"){


        resultado = calcularProdutoFixo(
            valor,
            300,
            "P45"
        );


    }




    mostrarResultadoNota(resultado);



}







// ===============================
// P20 / P45
// ===============================


function calcularProdutoFixo(
    valor,
    preco,
    tipo
){


    let quantidade = Math.floor(
        valor / preco
    );


    let total = quantidade * preco;



    return {

        tipo: tipo,

        itens:[

            {
                quantidade:quantidade,
                valor:preco
            }

        ],

        total:total,

        sobra:
        Number(
            (valor-total).toFixed(2)
        )

    };

}






// ===============================
// P13 INTELIGENTE
// ===============================


function calcularP13(valor, minimo){


    for(
        let quantidade=Math.floor(valor/minimo);
        quantidade>=0;
        quantidade--
    ){



        let restante =
        Number(
            (
                valor -
                (quantidade*minimo)
            )
            .toFixed(2)
        );




        let complemento =
        procurarComplemento(
            restante,
            minimo
        );





        if(
            complemento ||
            restante===0
        ){



            let itens=[];



            if(quantidade>0){


                itens.push({

                    quantidade:quantidade,

                    valor:minimo

                });


            }





            if(complemento){


                itens.push(complemento);


            }






            return {

                tipo:"P13",

                itens:itens,

                total:valor,

                sobra:0

            };


        }


    }




    return null;


}







// ===============================
// PROCURA VALOR COMPLEMENTO
// ===============================


function procurarComplemento(
    valor,
    minimo
){


    if(valor <= 0){

        return null;

    }





    for(
        let quantidade=1;
        quantidade<=200;
        quantidade++
    ){



        let valorGas =
        Number(
            (
                valor/quantidade
            )
            .toFixed(2)
        );





        if(
            valorGas >= minimo &&
            valorGas <= 120
        ){



            return {

                quantidade:quantidade,

                valor:valorGas

            };


        }


    }




    return null;


}

// ===============================
// MOSTRAR RESULTADO NOTA
// ===============================


function mostrarResultadoNota(resultado){


    let div = document.getElementById(
        "resultadoNota"
    );



    if(!resultado){


        div.innerHTML = 
        `
        <h3>
        Não foi encontrada uma combinação.
        </h3>
        `;


        return;

    }




    let conta="";




    resultado.itens.forEach(item=>{


        conta += `

        ${item.quantidade} x 
        ${dinheiro(item.valor)}
        =
        ${dinheiro(
            item.quantidade * item.valor
        )}

        <br>

        `;


    });





    div.innerHTML = `


    <h3>Conta:</h3>


    ${conta}


    <hr>


    <h2>
    Total:
    ${dinheiro(resultado.total)}
    </h2>



    <h3>
    Sobra:
    ${dinheiro(resultado.sobra)}
    </h3>


    `;



}








// ===============================
// CALCULADORA DE RAMPA
// ===============================


function calcularRampa(){



    let campos=[


        [
        "rAltura",
        "rFileira",
        "rColuna"
        ],



        [
        "extraAltura1",
        "extraFileira1",
        "extraColuna1"
        ],



        [
        "extraAltura2",
        "extraFileira2",
        "extraColuna2"
        ]

    ];





    let total=0;

    let conta="";





    campos.forEach(campo=>{


        let altura =
        Number(
            document.getElementById(campo[0]).value
        ) || 0;



        let fileira =
        Number(
            document.getElementById(campo[1]).value
        ) || 0;



        let coluna =
        Number(
            document.getElementById(campo[2]).value
        ) || 0;





        if(
            altura &&
            fileira &&
            coluna
        ){


            let resultado =
            altura *
            fileira *
            coluna;




            total += resultado;




            conta += `

            ${altura} x
            ${fileira} x
            ${coluna}
            =
            ${resultado}

            <br>

            `;



        }



    });







    let resultado =
    document.getElementById(
        "resultadoRampa"
    );





    if(total===0){


        resultado.innerHTML =
        "Digite os valores da rampa.";


        return;

    }






    resultado.innerHTML = `


    <h3>
    Conta:
    </h3>


    ${conta}



    <hr>


    <h2>
    Total:
    ${total}
    gases
    </h2>


    `;




}








// ===============================
// CONTAGEM MANUAL
// ===============================



function adicionarContagem(){



    let produto =
    document.getElementById(
        "produtoContagem"
    ).value;




    let quantidade =
    Number(
        document.getElementById(
            "quantidadeContagem"
        ).value
    );





    if(!quantidade){


        alert(
            "Informe a quantidade"
        );


        return;


    }





    contagem.push({


        produto:produto,


        quantidade:quantidade,


        data:
        new Date()
        .toLocaleString(
            "pt-BR"
        )


    });





    salvarContagem();


    mostrarContagem();


    atualizarResumo();



}






function salvarContagem(){


    localStorage.setItem(

        "contagemGas",

        JSON.stringify(contagem)

    );


}









function mostrarContagem(){



    let tabela =
    document.getElementById(
        "tabelaContagem"
    );




    if(!tabela) return;





    tabela.innerHTML="";






    contagem.forEach(
        (item,index)=>{


        tabela.innerHTML += `


        <tr>


        <td>
        ${item.produto}
        </td>


        <td>
        ${item.quantidade}
        </td>



        <td>

        <button onclick="
        removerContagem(${index})
        ">

        X

        </button>

        </td>


        </tr>


        `;


    });



}






function removerContagem(index){



    contagem.splice(
        index,
        1
    );


    salvarContagem();


    mostrarContagem();


    atualizarResumo();



}








// ===============================
// RESUMO
// ===============================



function atualizarResumo(){



    let resumo={


        "P13 Cheio":0,

        "P13 Vazio":0,

        "P20 Cheio":0,

        "P20 Vazio":0,

        "P45 Cheio":0,

        "P45 Vazio":0


    };







    contagem.forEach(item=>{


        if(resumo[item.produto] !== undefined){


            resumo[item.produto]
            +=
            item.quantidade;


        }


    });






    let html="";

    let total=0;





    Object.keys(resumo)
    .forEach(nome=>{


        total += resumo[nome];



        html += `

        <p>

        <b>${nome}</b>:
        ${resumo[nome]}

        </p>

        `;


    });






    html += `


    <hr>


    <h2>

    Total Geral:
    ${total}

    </h2>


    `;







    let div =
    document.getElementById(
        "resumo"
    );



    if(div){

        div.innerHTML=html;

    }




    atualizarDashboard(resumo);



    return resumo;



}

// ===============================
// DASHBOARD
// ===============================


function atualizarDashboard(resumo){


    let campos={


        "P13 Cheio":"dashP13Cheio",

        "P13 Vazio":"dashP13Vazio",

        "P20 Cheio":"dashP20Cheio",

        "P20 Vazio":"dashP20Vazio",

        "P45 Cheio":"dashP45Cheio",

        "P45 Vazio":"dashP45Vazio"


    };





    Object.keys(campos)
    .forEach(nome=>{


        let elemento =
        document.getElementById(
            campos[nome]
        );



        if(elemento){


            elemento.innerHTML =
            resumo[nome];


        }


    });





    let total =
    Object.values(resumo)
    .reduce(
        (a,b)=>a+b,
        0
    );





    let totalElemento =
    document.getElementById(
        "dashTotal"
    );



    if(totalElemento){


        totalElemento.innerHTML =
        total;


    }


}









// ===============================
// HISTÓRICO
// ===============================



function salvarHistorico(){



    let resumo =
    atualizarResumo();





    historico.push({


        data:

        new Date()
        .toLocaleString(
            "pt-BR"
        ),


        resumo:resumo


    });







    localStorage.setItem(

        "historicoGas",

        JSON.stringify(historico)

    );




    mostrarHistorico();


}








function mostrarHistorico(){



    let div =
    document.getElementById(
        "listaHistorico"
    );





    if(!div) return;





    div.innerHTML="";






    historico.forEach(item=>{


        div.innerHTML += `


        <div class="resultado">


        <b>
        ${item.data}
        </b>


        <br><br>


        ${JSON.stringify(
            item.resumo
        )}



        </div>



        `;


    });



}









// ===============================
// PDF
// ===============================



function gerarPDF(){



    const {jsPDF}=window.jspdf;



    let pdf =
    new jsPDF();





    let resumo =
    atualizarResumo();






    pdf.text(
        "São Jorge Gás - Fechamento",
        10,
        20
    );





    let y=40;





    Object.keys(resumo)
    .forEach(nome=>{


        pdf.text(

        nome+
        ": "+
        resumo[nome],

        10,

        y

        );


        y+=10;


    });





    pdf.save(
        "fechamento-gas.pdf"
    );



}








// ===============================
// BACKUP
// ===============================



function exportarBackup(){



    let dados={


        contagem:contagem,


        historico:historico


    };






    let arquivo =
    new Blob(

        [
        JSON.stringify(
            dados,
            null,
            2
        )
        ],

        {
        type:
        "application/json"
        }

    );






    let link =
    document.createElement(
        "a"
    );



    link.href =
    URL.createObjectURL(
        arquivo
    );



    link.download =
    "backup-sao-jorge.json";



    link.click();



}








// ===============================
// IA SÃO JORGE
// ===============================



function perguntarIA(){



    let campo =
    document.getElementById(
        "perguntaIA"
    );



    let pergunta =
    campo.value.trim();





    if(!pergunta)
    return;





    let texto =
    pergunta.toLowerCase();




    let resposta="";







    if(
    texto.includes("rampa")
    ){


        resposta=`

        Para calcular a rampa:

        1º Informe altura.

        2º Informe fileira.

        3º Informe coluna.

        O sistema faz:

        Altura × Fileira × Coluna.

        Depois soma as partes extras.

        `;


    }






    else if(
    texto.includes("nota")
    ||
    texto.includes("calculo")
    ){


        resposta=`

        Para calcular uma nota:

        1º Escolha P13, P20 ou P45.

        2º Se for P13 escolha
        a tabela 76, 78, 80 ou 82.

        3º Informe o valor.

        Eu procuro a melhor combinação
        respeitando os limites.

        Depois mostro a conta passo a passo.

        `;


    }






    else if(
    texto.includes("contagem")
    ||
    texto.includes("fechamento")
    ){


        resposta=`

        A contagem deve ser separada:

        P13 Cheio e Vazio.

        P20 Cheio e Vazio.

        P45 Cheio e Vazio.

        Assim o fechamento fica correto.

        `;


    }






    else if(
    texto.includes("telefone")
    ||
    texto.includes("contato")
    ){


        resposta=`

        O contato cadastrado da São Jorge Gás:

        📞 (31) 3817-2759

        `;


    }







    else{


        resposta=`

        Posso ajudar com:

        • cálculo de notas;
        • tabela fiscal;
        • rampa;
        • contagem;
        • fechamento;
        • explicações passo a passo.

        Me explique sua dúvida que eu ajudo.

        `;


    }






    document.getElementById(
        "chatIA"
    ).innerHTML += `



    <p>

    <b>Você:</b>
    ${pergunta}

    </p>



    <p>

    <b>São Jorge:</b>
    ${resposta}

    </p>



    <hr>


    `;






    campo.value="";


}








// ===============================
// INICIAR SISTEMA
// ===============================



window.onload=function(){


    mostrarContagem();


    atualizarResumo();


    mostrarHistorico();


    mostrarTela(
        "dashboard"
    );


}
