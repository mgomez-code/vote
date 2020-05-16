const contractSource = `
include "List.aes" //incluir el archivo

contract Vote =

  record candidates = {  // Valores claves a guardar
    voters  : list(address),
    exist   : bool  }

  record state = {  // Variables definidas
    votes: map(address, candidates) }

  entrypoint init() : state = {  //Función de Inicio
    votes = {} }

  stateful entrypoint vote(candidate: address) =  //Función para votar por una dirección
    if (is_candidate(candidate))
      let current_votes = state.votes[candidate].voters
      put(state{ votes[candidate].voters = Call.caller :: current_votes })

  entrypoint count_votes(candidate : address) : int =  //Función para mostrar los votos según una dirección
    let candidate_found = Map.lookup_default(candidate, state.votes, { voters = [], exist = false })
    List.length(candidate_found.voters)

  stateful entrypoint add_candidate(candidate: address) =  //Función para agregar una dirección
    if (!(is_candidate'(candidate)))
      put(state{votes[candidate] = { voters = [], exist = true }})

  entrypoint is_candidate(candidate: address) : bool =  //Función para verificar una dirección
    is_candidate'(candidate)

  function is_candidate'(candidate: address) : bool =  //Función para validar una dirección
    let candidate_found = Map.lookup_default(candidate, state.votes, { voters = [], exist = false })
    candidate_found.exist
      
  //Funciones básicas
  
  stateful entrypoint contract_creator() = //dirección que creo el contracto
    Contract.creator

  stateful entrypoint contract_address() = //dirección del contracto
    Contract.address

  stateful entrypoint contract_balance() = //balance del contracto
    Contract.balance
`;

//Address of the  smart contract on the testnet of the aeternity blockchain
//Dirección del contrato inteligente en el testnet de la blockchain de aeternity
const contractAddress = 'ct_2Bm3BZJFnrSXADXUKqmzPZVuLJg73e6yjz87oEKNUJZAY5MUGU';

//Create variable for client so it can be used in different functions
//Crear la variable cliente para las funciones
var client = null;

//Create a new global array for the candidates
//Crea un array para los candidatos
var candidateArray = [];

//Create a asynchronous read call for our smart contract
//Cree una llamada de lectura asincrónica para uso de funciones estáticas
async function callStatic(func, args) {

	//Create a new contract instance that we can interact with
	//Cree una nueva instancia de contrato con la que podamos interactuar
	const contract = await client.getContractInstance(contractSource, {contractAddress});

	//Make a call to get data of smart contract func, with specefied arguments
	//Realice una llamada para obtener datos de funciones de contratos inteligentes, con argumentos específicos
	const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));

	//Make another call to decode the data received in first call
	//Realice otra llamada para decodificar los datos recibidos en la primera llamada
	const decodedGet = await calledGet.decode().catch(e => console.error(e));

	return decodedGet;
}

//Create a asynchronous write call for our smart contract
//Cree una llamada de escritura asincrónica para las funciones dinámicas
async function contractCall(func, args, value) {
	
	//Make a call to write smart contract func, with aeon value input
	//Realice una llamada para escribir una función de contrato inteligente, con una entrada de valor eón
	const contract = await client.getContractInstance(contractSource, {contractAddress});
	
	//Make a call to get data of smart contract func, with specefied arguments
	//Realice una llamada para obtener datos de funciones de contratos inteligentes, con argumentos específicos
	const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

	return calledSet;
}

//Execute main function
//Ejecutar función principal
window.addEventListener('load', async () => {

	//Display the loader animation so the user knows that something is happening
	//Muestra la animación de cargando....
	$("#loader").show();

	//Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
	//Inicialice el objeto Aepp a través de aepp-sdk.browser.js, la aplicación base debe estar ejecutándose.
	client = await Ae.Aepp();

	//Hide loader animation
	//Oculta la animación de cargando
	$("#loader").hide();
});

function yes() {
    div = document.getElementById('yes');
    div.style.display = '';
    }

function no() {
    div = document.getElementById('no');
    div.style.display = '';
    }

function votes() {
    div = document.getElementById('votes');
    div.style.display = '';
    }

//If someone clicks to consult a candidate,  execute is_candidate
//Si alguien hace clic para consultar un candidato, ejecute is_candidate
$('#isBtn').click(async function(){
	$("#loader").show();

	client = await Ae.Aepp();

	//Create new variable for get the values from the input fields
	//Crea nueva variables para obtener los valores de los campos de entrada.
	const address = ($('#Address').val());

	//Make the contract call to consult the candidate with the newly passed values
	//Llame al contrato para consultar el candidato con los valores recibidos
	const consul = await callStatic('is_candidate',[address]);

	//Show notice
	//Mostrar avisos
	if (consul) {
		yes();
	} else {
		no(); 
	}

  $("#loader").hide();
});

//If someone clicks to register a candidate, get the input and execute the add_candidate
//Si alguien hace clic para registrar un candidate, obtenga la entrada y ejecute el add_candidate
$('#addBtn').click(async function(){
	$("#loader").show();

	//Create new variable for get the values from the input fields
	//Crea nueva variables para obtener los valores de los campos de entrada.
	const address = ($('#Address').val());

	//Make the contract call to register the candidate with the newly passed values
	//Llame al contrato para registrar el candidato con los valores recibidos
	await contractCall('add_candidate', [address], 0);


	//Reset page
	//Reiniciar la página
	$('form').trigger("reset");
	$("#loader").hide();
});

//If someone clicks to register a vote, get the input and execute the vote
//Si alguien hace clic para votar, obtenga la entrada y ejecute el vote
$('#voteBtn').click(async function(){
	$("#loader").show();

	//Create new variable for get the values from the input fields
	//Crea nueva variables para obtener los valores de los campos de entrada.
	const address = ($('#Address').val());

	//Make the contract call to register the vote with the newly passed values
	//Llame al contrato para registrar voto con los valores recibidos
	await contractCall('vote', [address], 0);

	//Reset page
	//Reiniciar la página
	$('form').trigger("reset");
	$("#loader").hide();
});

//If someone clicks to consult a votes,  execute count_votes
//Si alguien hace clic para consultar votos, ejecute count_votes
$('#countBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const address = ($('#Address').val());
	const consul = await callStatic('count_votes',[address]);
	document.getElementById("textvotes").innerHTML = "Votes: "+consul;

	//Show votes
	//Mostrar votes
	votes();
	$("#loader").hide();
});