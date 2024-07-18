// Definindo referências para elementos da página
var authForm = document.getElementById('authForm')
var authFormTitle = document.getElementById('authFormTitle')
var register = document.getElementById('register')
var access = document.getElementById('access')
var loading = document.getElementById('loading')
var auth = document.getElementById('auth')
var userContent = document.getElementById('userContent')
var userEmail = document.getElementById('userEmail')
var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')
var emailVerified = document.getElementById('emailVerified')
var passwordReset = document.getElementById('passwordReset')
var userName = document.getElementById('userName')
var userImg = document.getElementById('userImg')

var taskForm = document.getElementById('taskForm')
var taskForm = document.getElementById('taskForm')
var taskCount = document.getElementById('taskCount')
var ulTaskList = document.getElementById('ulTaskList')

var search = document.getElementById('search')

var progressFeedback = document.getElementById('progressFeedback')
var progress = document.getElementById('progress')

var playPauseBtn = document.getElementById('playPauseBtn')
var cancelBtn = document.getElementById('cancelBtn')

var cancelUpdateTask = document.getElementById('cancelUpdateTask')
var taskFormTitle = document.getElementById('taskFormTitle')



// Alterar o formulário de autenticação para o cadastro de novas contas
function toggleToRegister() {
  authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
  authFormTitle.innerHTML = 'Insira seus dados para se cadastrar'
  hideItem(register) // Esconder atalho para cadastrar conta
  hideItem(passwordReset) // Esconder a opção de redefinição de senha
  showItem(access) // Mostrar atalho para acessar conta
}

// Alterar o formulário de autenticação para o acesso de contas já existentes
function toggleToAccess() {
  authForm.submitAuthForm.innerHTML = 'Acessar'
  authFormTitle.innerHTML = 'Acesse a sua conta para continuar'
  hideItem(access) // Esconder atalho para acessar conta
  showItem(passwordReset) // Mostrar a opção de redefinição de senha
  showItem(register) // Mostrar atalho para cadastrar conta
}

// Simplifica a exibição de elementos da página
function showItem(element) {
  element.style.display = 'block'
}

// Simplifica a remoção de elementos da página
function hideItem(element) {
  element.style.display = 'none'
}

// Mostrar conteúdo para usuários autenticados
function showUserContent(user) {
  //console.log(user)
  if (user.providerData[0].providerId != 'password') {
    emailVerified.innerHTML = 'Autenticação por provedor confiável, não é necessário verificar e-mail'
    hideItem(sendEmailVerificationDiv)
  } else {
    if (user.emailVerified) {
      emailVerified.innerHTML = 'E-mail verificado'
      hideItem(sendEmailVerificationDiv)
    } else {
      emailVerified.innerHTML = 'E-mail não verificado'
      showItem(sendEmailVerificationDiv)
    }
  }

  userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'
  userName.getElementsByTagName('span')[0].innerHTML = user.displayName
  userEmail.getElementsByTagName('span')[0].innerHTML = user.email
  hideItem(auth)

  getDefaultTaskList()
  //Busca tarefas filtradas somente uma vez (once/GET)
  search.onkeyup = function () {
    if (search.value != '') {
      var searchText = search.value.toLowerCase()
      dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas')
        .orderBy('nameLowerCase')
        .startAt(searchText).endAt(searchText + '\uf8ff')
        .get().then(function (dataSnapshot) {
          fillTaskList(dataSnapshot)
        })
      /* dbRefUsers.child(user.uid)
       .orderByChild('nameLowerCase')//Ordena as tarefas pelo nome da tarefa
       .startAt(searchText).endAt(searchText + '\uf8ff')//Delimita os resultados (nomes de tarefas que comecem com o termo pesquisado)
       .once('value').then(function(dataSnapshot){  //Buscar tarefas filtradas somente uma vez(once)
         fillTaskList(dataSnapshot)
       })*/
    } else {
      getDefaultTaskList()
    }
  }

  showItem(userContent)
}

//Buscar tarefas em tempo real (listagem padrão usando o on/onSnapshot)
function getDefaultTaskList() {

  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas')
    .orderBy('nameLowerCase').onSnapshot(function (dataSnapshot) {
      fillTaskList(dataSnapshot)
    })
  /*dbRefUsers.child(firebase.auth().currentUser.uid)
  .orderByChild('nameLowerCase')//Ordena as tarefas pelo nome da tarefa
  .on('value', function(dataSnapshot){
    fillTaskList(dataSnapshot)
  })*/
}

// Mostrar conteúdo para usuários não autenticados
function showAuth() {
  authForm.email.value = ''
  authForm.password.value = ''
  hideItem(userContent)
  showItem(auth)
}

// centralizar e traduzir erros
function showError(prefix, error) {
  console.log(error.code)
  hideItem(loading)

  switch (error.code) {
    case 'auth/invalid-email': alert(prefix + ' ' + 'E-mail inválido!')
      break;
    case 'auth/wrong-password': alert(prefix + ' ' + 'Senha inválida!')
      break;
    case 'auth/weak-password': alert(prefix + ' ' + 'Senha deve ter ao menos 6 caracteres!')
      break;
    case 'auth/email-already-in-use': alert(prefix + ' ' + 'E-mail já está em uso por outra conta!')
      break;
    case 'auth/popup-closed-by-user': alert(prefix + ' ' + 'O popup de autenticação foi fechado antes da operação ser concluída!')
      break;
    case 'storage/canceled':
      break;
    case 'storage/unauthorized': alert(prefix + ' ' + 'Falha ao acessar o Cloud Storage!')
      break;

    default: alert(prefix + ' ' + error.message)
  }
}

// Atributos extras de configuração de e-mail
var actionCodeSettings = {
  url: 'http://tasklist-dcacc.firebaseapp.com'
}

//Referências ao realtime data base
var database = firebase.database()
var dbRefUsers = database.ref('users')

//Referencia ao firestore

var dbFirestore = firebase.firestore().collection('users')