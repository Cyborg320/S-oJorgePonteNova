// ==========================================
// SÃO JORGE GÁS
// SCRIPT.JS DEFINITIVO
// PARTE 1/3
// ==========================================


// ===============================
// BANCO LOCAL
// ===============================


let contagem =
JSON.parse(
localStorage.getItem("contagemGas")
)
|| [];


let historico =
JSON.parse(
localStorage.getItem("historicoGas")
)
|| [];





// ===============================
// UTILIDADES
// ===============================


function dinheiro(valor){

return Number(valor)
.toLocaleString(
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

.replace(".","")

.replace(",", ".")

);


}









// ===============================
// TROCAR TELAS
// ===============================


function mostrarTela(id){


document.querySelectorAll(".tela")
.forEach(tela=>{


tela.classList.add("escondido");


});



document.getElementById(id)
.classList.remove("escondido");



}





// ===============================
// CALCULO NOTA
// ===============================



let resultadoNota=null;





function calcularNota(){



let tipo =

document.getElementById(
"tipoGas"
).value;




let valor =

numero(

document.getElementById(
"valorNota"
).value

);





let tabela =

Number(

document.getElementById(
"tabelaP13"
).value

);






if(!valor){


alert(
"Digite o valor da nota"
);


return;


}







if(tipo==="P13"){



resultadoNota =

calcularP13(

valor,

tabela

);



}





if(tipo==="P20"){



resultadoNota =

calcularFixo(

valor,

130,

"P20"

);


}







if(tipo==="P45"){



resultadoNota =

calcularFixo(

valor,

300,

"P45"

);


}





mostrarResultadoNota();



}









// ===============================
// P20 E P45
// ===============================


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








// ===============================
// P13 INTELIGENTE
// ===============================



function calcularP13(

valor,

minimo

){





for(

let qtd=

Math.floor(

valor/minimo

);


qtd>=0;


qtd--

){





let valorBase =

qtd*minimo;





let resto =

Number(

(

valor -

valorBase

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








// ===============================
// PROCURA COMPLEMENTO
// ===============================



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



let preco =

Number(

(

valor/qtd

)

.toFixed(2)

);






if(

preco>=minimo

&&

preco<=120

){



return {


qtd:qtd,


valor:preco


};



}



}



return null;


}









// ===============================
// MOSTRAR RESULTADO NOTA
// ===============================


function mostrarResultadoNota(){



let div=

document.getElementById(
"resultadoNota"
);





if(!resultadoNota){



div.innerHTML=

"Não foi encontrada combinação exata.";

return;


}






let conta="";





resultadoNota.lista
.forEach(item=>{



conta += `


${item.qtd}

x

${dinheiro(item.valor)}

=

${dinheiro(

item.qtd*

item.valor

)}


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
// ==========================================
// SÃO JORGE GÁS
// SCRIPT.JS DEFINITIVO
// PARTE 2/3
// ==========================================






// ===============================
// RAMPA
// ===============================


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



let altura=

Number(

document.getElementById(p[0])
.value

||0

);



let fileira=

Number(

document.getElementById(p[1])
.value

||0

);



let coluna=

Number(

document.getElementById(p[2])
.value

||0

);







if(

altura>0 &&

fileira>0 &&

coluna>0

){



let resultado=

altura*

fileira*

coluna;





total+=resultado;




conta += `


${altura}

x

${fileira}

x

${coluna}

=

${resultado}

<br>


`;



}



});






if(total===0){



document.getElementById(
"resultadoRampa"
).innerHTML=

"Informe as medidas da rampa.";


return;


}






document.getElementById(
"resultadoRampa"
).innerHTML=`

<h3>Conta:</h3>


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
"Digite uma quantidade"
);


return;


}







contagem.push({

produto,

quantidade,

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









// ===============================
// MOSTRAR CONTAGEM
// ===============================


function mostrarContagem(){



let tabela =

document.getElementById(
"tabelaContagem"
);




if(!tabela)

return;






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


<button onclick="removerContagem(${index})">

X

</button>


</td>


</tr>


`;



}

);



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



if(

resumo[item.produto]

!==undefined

){


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




html+=`


<p>

<b>${nome}</b>

:

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







let div=

document.getElementById(
"resumo"
);





if(div)

div.innerHTML=html;





atualizarDashboard(resumo);



return resumo;



}








// ===============================
// DASHBOARD
// ===============================


function atualizarDashboard(resumo){



let campos={


"P13 Cheio":
"dashP13Cheio",


"P13 Vazio":
"dashP13Vazio",


"P20 Cheio":
"dashP20Cheio",


"P20 Vazio":
"dashP20Vazio",


"P45 Cheio":
"dashP45Cheio",


"P45 Vazio":
"dashP45Vazio"


};





Object.keys(campos)

.forEach(nome=>{


let campo=

document.getElementById(
campos[nome]
);



if(campo)

campo.innerHTML=

resumo[nome];


});





let total=

Object.values(resumo)

.reduce(

(a,b)=>a+b,

0

);






let totalTela=

document.getElementById(
"dashTotal"
);





if(totalTela)

totalTela.innerHTML=total;



}









// ===============================
// HISTÓRICO
// ===============================


function salvarHistorico(){



let resumo=

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



let div=

document.getElementById(
"listaHistorico"
);





if(!div)

return;





div.innerHTML="";





historico.forEach(item=>{



div.innerHTML += `


<p>


<b>

${item.data}

</b>


<br>


${JSON.stringify(item.resumo)}


</p>


<hr>


`;



});



}
// ==========================================
// SÃO JORGE GÁS
// SCRIPT.JS DEFINITIVO
// PARTE 3/3
// ==========================================






// ===============================
// GERAR PDF
// ===============================


function gerarPDF(){



const {jsPDF}=window.jspdf;



let pdf=new jsPDF();





let resumo=

atualizarResumo();






pdf.text(

"São Jorge Gás - Fechamento",

10,

20

);




let y=35;




Object.keys(resumo)

.forEach(nome=>{


pdf.text(

`${nome}: ${resumo[nome]}`,

10,

y

);


y+=10;



});





pdf.save(

"fechamento-sao-jorge-gas.pdf"

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





let arquivo=

new Blob(

[

JSON.stringify(

dados,

null,

2

)

],

{

type:"application/json"

}

);





let link=

document.createElement(
"a"
);



link.href=

URL.createObjectURL(
arquivo
);



link.download=

"backup-sao-jorge-gas.json";



link.click();



}









function importarBackup(event){



let arquivo=

event.target.files[0];




let leitor=

new FileReader();






leitor.onload=function(e){



let dados=

JSON.parse(
e.target.result
);





contagem=

dados.contagem || [];



historico=

dados.historico || [];





salvarContagem();



localStorage.setItem(

"historicoGas",

JSON.stringify(historico)

);





mostrarContagem();



atualizarResumo();



mostrarHistorico();




alert(

"Backup restaurado com sucesso!"

);



}





leitor.readAsText(arquivo);



}









// ===============================
// IA SÃO JORGE
// ===============================



function perguntarIA(){



let pergunta =

document.getElementById(
"perguntaIA"
).value;





if(!pergunta)

return;






let texto=

pergunta.toLowerCase();






let resposta="";









if(

texto.includes("oi")

||

texto.includes("olá")

||

texto.includes("ola")

){



resposta=

`
Olá! 👋

Sou o Assistente São Jorge.

Posso ajudar você com:

• cálculo de nota fiscal;
• rampa;
• contagem;
• fechamento;
• explicações passo a passo.

Pode perguntar o que precisar.
`;



}







else if(

texto.includes("rampa")

){



resposta=

`
Vamos fazer a rampa passo a passo:

1º - Informe a altura.

2º - Informe a quantidade de fileiras.

3º - Informe a quantidade de colunas.

O cálculo será:

Altura × Fileira × Coluna

Exemplo:

4 × 10 × 16

Resultado:

640 posições.
`;



}








else if(

texto.includes("nota")

||

texto.includes("calculo")

){



resposta=

`
Para calcular uma nota:

1º - Escolha o tipo:

P13, P20 ou P45.

2º - Se for P13 escolha a tabela:

76, 78, 80 ou 82.

3º - Informe o valor.

O sistema procura uma combinação respeitando:

✔ valor mínimo da tabela;

✔ máximo de R$120 por P13;

✔ menor sobra possível.

Depois ele mostra a conta completa.
`;



}







else if(

texto.includes("tabela")

){



resposta=

`
As tabelas disponíveis para P13 são:

Tabela 76
Tabela 78
Tabela 80
Tabela 82

A tabela escolhida define o valor mínimo usado no cálculo.
`;



}








else if(

texto.includes("telefone")

||

texto.includes("contato")

){



resposta=

`
O contato cadastrado da São Jorge Gás de Ponte Nova é:

📞 (31) 3817-2759

Caso seja necessário confirmar informações comerciais, entre em contato diretamente.
`;



}







else if(

texto.includes("fechamento")

||

texto.includes("contagem")

){



resposta=

`
O fechamento deve ser conferido separado:

P13 Cheio
P13 Vazio

P20 Cheio
P20 Vazio

P45 Cheio
P45 Vazio

Assim evita misturar recipientes.
`;



}






else{



resposta=

`
Entendi sua pergunta.

Eu posso ajudar explicando:

- como fazer cálculos;
- como conferir uma nota;
- como usar a rampa;
- como fazer a contagem;
- como organizar o fechamento.

Tente explicar com mais detalhes que eu te ajudo.
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






document.getElementById(
"perguntaIA"
).value="";



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
