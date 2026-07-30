// =====================================
// SÃO JORGE GÁS
// SCRIPT.JS COMPLETO
// =====================================


let resultadoNota = null;


let fechamento =
JSON.parse(
localStorage.getItem("fechamentoGas")
)
|| [];


let historico =
JSON.parse(
localStorage.getItem("historicoGas")
)
|| [];





// =====================================
// FORMATOS
// =====================================


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

return Number(
String(valor)
.replace(/\./g,"")
.replace(",",".")
);

}







// =====================================
// NOTA FISCAL
// =====================================


function calcularNota(){


let valor =
numero(
document.getElementById("valorNota").value
);



let tipo =
document.getElementById("tipoGasNota").value;



let tabela =
Number(
document.getElementById("tabelaNota").value
);




if(!valor){

alert("Digite o valor da nota");

return;

}





if(tipo=="P13"){


resultadoNota =
calcularP13(valor,tabela);


}



if(tipo=="P20"){


resultadoNota =
calcularFixo(
valor,
130,
"P20"
);


}



if(tipo=="P45"){


resultadoNota =
calcularFixo(
valor,
300,
"P45"
);


}




mostrarNota();


}









// =====================================
// P20 E P45
// =====================================


function calcularFixo(
valor,
preco,
tipo
){



let quantidade =
Math.floor(
valor/preco
);



return {


tipo:tipo,


lista:[{

qtd:quantidade,

valor:preco

}],



total:

quantidade*preco,



sobra:

Number(
(
valor -
(quantidade*preco)
)
.toFixed(2)
)


};


}








// =====================================
// P13 INTELIGENTE
// =====================================


function calcularP13(
valor,
minimo
){



for(
let qtd =
Math.floor(valor/minimo);

qtd>=0;

qtd--
){



let base =
qtd*minimo;



let resto =
Number(
(
valor-base
)
.toFixed(2)
);




let complemento =
acharComplemento(
resto,
minimo
);





if(complemento){



let lista=[];



if(qtd>0){


lista.push({

qtd:qtd,

valor:minimo

});


}



if(complemento){

lista.push(complemento);

}




return {


tipo:"P13",

lista:lista,

total:valor,

sobra:0


};



}



}



return null;


}









function acharComplemento(
valor,
minimo
){



if(valor===0)
return null;




for(
let qtd=1;

qtd<=100;

qtd++
){



let valorCada =
Number(
(
valor/qtd
)
.toFixed(2)
);




if(
valorCada>=minimo &&
valorCada<=120
){



return {


qtd:qtd,

valor:valorCada


};



}



}



return null;


}









// =====================================
// MOSTRAR NOTA
// =====================================


function mostrarNota(){


let div =
document.getElementById(
"resultadoNota"
);



if(!resultadoNota){


div.innerHTML =
"Não foi possível fechar a conta";


return;

}



let conta="";




resultadoNota.lista.forEach(item=>{


conta += `

${item.qtd} x ${dinheiro(item.valor)}

=

${dinheiro(item.qtd*item.valor)}

<br>

`;


});




div.innerHTML=`


<h3>Conta:</h3>


${conta}


<hr>


<b>

Resultado:
${dinheiro(resultadoNota.total)}

</b>


<br>


<b>

Sobra:
${dinheiro(resultadoNota.sobra)}

</b>


`;



}









// =====================================
// RAMPA
// =====================================


function calcularRampa(){



let partes=[


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





partes.forEach(p=>{



let altura =
Number(
document.getElementById(p[0]).value || 0
);



let fileira =
Number(
document.getElementById(p[1]).value || 0
);



let coluna =
Number(
document.getElementById(p[2]).value || 0
);





if(
altura>0 &&
fileira>0 &&
coluna>0
){



let resultado =
altura*
fileira*
coluna;




total+=resultado;




conta += `

${altura} x ${fileira} x ${coluna}

=

${resultado}

<br>

`;



}



});





document.getElementById(
"resultadoRampa"
).innerHTML=`


<h3>Conta:</h3>


${conta}


<hr>


<h2>

Total:
${total} gases

</h2>


`;



}









// =====================================
// CONTAGEM MANUAL
// =====================================


function adicionarManual(){



let produto =
document.getElementById(
"produtoFechamento"
).value;



let quantidade =
Number(
document.getElementById(
"quantidadeFechamento"
).value
);




if(!quantidade){

alert("Digite a quantidade");

return;

}




fechamento.push({

produto,

quantidade

});



salvarLocal();


mostrarFechamento();


atualizarResumo();



}







function adicionarNotaFechamento(){


if(!resultadoNota)
return;




let quantidade=0;


resultadoNota.lista.forEach(item=>{


quantidade+=item.qtd;


});




fechamento.push({

produto:
resultadoNota.tipo+" Cheio",

quantidade

});



salvarLocal();

mostrarFechamento();

atualizarResumo();


}








function salvarLocal(){


localStorage.setItem(

"fechamentoGas",

JSON.stringify(fechamento)

);


}









function mostrarFechamento(){


let tabela =
document.getElementById(
"tabelaFechamento"
);



if(!tabela)
return;



tabela.innerHTML="";



fechamento.forEach((item,index)=>{


tabela.innerHTML += `


<tr>


<td>${item.produto}</td>


<td>${item.quantidade}</td>


<td>

<button onclick="removerItem(${index})">

X

</button>

</td>


</tr>


`;



});


}







function removerItem(index){


fechamento.splice(index,1);


salvarLocal();


mostrarFechamento();


atualizarResumo();


}









// =====================================
// RESUMO
// =====================================


function atualizarResumo(){



let resumo={


"P13 Cheio":0,
"P13 Vazio":0,

"P20 Cheio":0,
"P20 Vazio":0,

"P45 Cheio":0,
"P45 Vazio":0


};





fechamento.forEach(item=>{


if(resumo[item.produto]!==undefined){


resumo[item.produto]+=item.quantidade;


}


});




let total=0;

let html="";




Object.keys(resumo).forEach(nome=>{


total+=resumo[nome];



html+=`

<p>

<b>${nome}</b>:
${resumo[nome]}

</p>

`;



});




html+=`

<hr>

<h3>

Total Geral:
${total}

</h3>

`;





document.getElementById(
"resumoFechamento"
).innerHTML=html;



return resumo;


}









// =====================================
// HISTÓRICO
// =====================================


function salvarHistorico(){


let resumo =
atualizarResumo();




historico.push({

data:
new Date()
.toLocaleString("pt-BR"),


resumo

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
"historico"
);



if(!div)
return;




div.innerHTML="";



historico.forEach(item=>{


div.innerHTML+=`

<p>

<b>${item.data}</b>

<br>


${JSON.stringify(item.resumo)}

</p>

<hr>

`;



});



}









// =====================================
// PDF
// =====================================


function gerarPDF(){


const {jsPDF}=window.jspdf;


let pdf=new jsPDF();



let resumo=atualizarResumo();



pdf.text(
"São Jorge Gás - Fechamento",
10,
20
);



let y=35;



Object.keys(resumo).forEach(nome=>{


pdf.text(

`${nome}: ${resumo[nome]}`,

10,

y

);



y+=10;


});



pdf.save(
"fechamento-gas.pdf"
);



}









// =====================================
// ASSISTENTE
// =====================================


function perguntarIA(){



let pergunta =
document.getElementById(
"perguntaIA"
).value;



let texto =
pergunta.toLowerCase();



let resposta="";





if(texto.includes("oi") ||
texto.includes("ola")){


resposta=
"Olá! Sou o assistente do São Jorge Gás. Posso ajudar você a conferir notas, rampa, contagem e organização do fechamento.";


}


else if(texto.includes("rampa")){


resposta=
"A rampa funciona com altura × fileira × coluna. Você pode colocar várias partes e eu somo tudo para facilitar sua contagem.";


}


else if(texto.includes("nota")){


resposta=
"Na nota fiscal eu verifico o tipo escolhido, a tabela do P13 e procuro uma combinação respeitando o limite máximo de R$120 por gás.";


}


else if(texto.includes("fechamento")){


resposta=
"O fechamento fica separado por P13, P20 e P45, dividindo Cheio e Vazio para facilitar a conferência do estoque.";


}


else{


resposta=
"Entendi. Me explique melhor o que você precisa verificar e vou tentar ajudar da melhor forma possível.";


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


`;



document.getElementById(
"perguntaIA"
).value="";



}








// =====================================
// INICIALIZAÇÃO
// =====================================


window.onload=function(){


mostrarFechamento();


atualizarResumo();


mostrarHistorico();


}
function calcularRampa(){

    let total = 0;
    let conta = "";


    const campos = [
        ["rAltura","rFileira","rColuna"],
        ["extraAltura1","extraFileira1","extraColuna1"],
        ["extraAltura2","extraFileira2","extraColuna2"]
    ];


    campos.forEach(campo => {


        let altura = Number(
            document.getElementById(campo[0]).value
        ) || 0;


        let fileira = Number(
            document.getElementById(campo[1]).value
        ) || 0;


        let coluna = Number(
            document.getElementById(campo[2]).value
        ) || 0;



        if(
            altura > 0 &&
            fileira > 0 &&
            coluna > 0
        ){

            let resultado =
            altura * fileira * coluna;


            total += resultado;


            conta += `

            ${altura} x ${fileira} x ${coluna}

            = ${resultado}

            <br>

            `;

        }


    });



    if(total === 0){

        document.getElementById(
            "resultadoRampa"
        ).innerHTML =
        "Informe pelo menos uma medida.";

        return;

    }



    document.getElementById(
        "resultadoRampa"
    ).innerHTML = `


    <h3>Conta:</h3>

    ${conta}


    <hr>


    <h2>
    Total: ${total} gases
    </h2>


    `;

}