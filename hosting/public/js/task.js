// trata a submissão do formulário de Tarefas
taskForm.onsubmit = function (event) {
  event.preventDefault()//Evita o redirecionamento da página

  if (taskForm.name.value != '') {
    var file = taskForm.file.files[0]//Seleciona o primeiro arquivo da seleção de arquivos 
    if (file != null) {//Verifiva se o arquivo foi selecionado
      if (file.type.includes('image')) {//Verifica se o arquivo é uma imagem


        if(file.size > 1024 * 1024 * 2){
          alert('A imagem não pode ser maior que 2MB. A imagem selecionada tem ' + (file.size / 1024 / 1024).toFixed(3) + 'MB')
          return
        }

        //Compõe o nome do arquivo
        var imgName = firebase.database().ref().push().key + '-' + file.name
        //Compõe o caminho do arquivo
        var imgPath = 'taskListFiles/' + firebase.auth().currentUser.uid + '/' + imgName
        //Cria uma referencia de arquivo usando o caminho criado na linha acima
        var storageRef = firebase.storage().ref(imgPath)
        //Inicia o processo de upload  
        var upload = storageRef.put(file)

        trackUpload(upload).then(function () {
          storageRef.getDownloadURL().then(function (downloadURL) {
            var data = {
              imgUrl: downloadURL,
              name: taskForm.name.value,
              nameLowerCase: taskForm.name.value.toLowerCase(),
              descricao: taskForm.desc.value,
              prazo: taskForm.prazo.value,
              tempo: taskForm.tempo.value
            }
  
            completeTaskCreate(data)//Completa a criação de tarefas
          })      
        }).catch(function (error) {
          showError('Falha ao adicionar tarefa: ', error)
        })
      } else {
        alert('O arquivo selecionado precisa ser uma imagem. Tente novamente')
      }
    } else {
      var data = {
        name: taskForm.name.value,
        nameLowerCase: taskForm.name.value.toLowerCase(),
        descricao: taskForm.desc.value,
        prazo: taskForm.prazo.value,
        tempo: taskForm.tempo.value
      }

     
      completeTaskCreate(data)//Completa a criação de tarefas
      
    }
  } else {
    alert('O nome da tarefa não pode ser em branco para criar a tarefa!')
  }
}

//Completa a criação de tarefas
function completeTaskCreate(data){
  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').add(data).then(function(){
    console.log('Tarefa "' + data.name + '" adicionada com sucesso')
    taskForm.name.value = ''
   taskForm.file.value = ''
   taskForm.desc.value = ''
   taskForm.prazo.value = ''
   taskForm.tempo.value = ''
  }).catch(function (error) {
    showError('Falha ao adicionar tarefa (use no máximo 30 caracteres): ', error)
  })


   

}


// Rastreia o progresso de upload
function trackUpload(upload) {
  return new Promise(function (resolve, reject) {
    showItem(progressFeedback)
    upload.on('state_changed',
      function (snapshot) { // Segundo argumento: Recebe informações sobre o upload
        console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2) + '%')
        progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100
      }, function (error) { // Terceiro argumento: Função executada em caso de erro no upload
        hideItem(progressFeedback)
        reject(error)
      },
      function () { // Quarto argumento: Função executada em caso de sucesso no upload
        console.log('Sucesso no upload')
        hideItem(progressFeedback)
        resolve()
      })

    var playPauseUpload = true // Estado de controle do nosso upload (pausado ou em andamento)
    playPauseBtn.onclick = function () { // Botão para pausar/continuar upload clicado
      playPauseUpload = !playPauseUpload // Inverte o estado de controle do upload

      if (playPauseUpload) { // Se deseja retomar o upload, faça...
        upload.resume() // Retoma o upload

        playPauseBtn.innerHTML = 'Pausar'
        console.log('Upload retomado')
      } else { // Se deseja pausar o upload, faça...
        upload.pause() // Pausa o upload

        playPauseBtn.innerHTML = 'Continuar'
        console.log('Upload pausado')
      }
    }

    cancelBtn.onclick = function () { // Botão para cancelar upload clicado
      upload.cancel() // Cancela o upload
      hideItem(progressFeedback)
      resetTaskForm()
    }
  })
}

//Exibe a lista de tarefas do usuário
function fillTaskList(dataSnapshot) {
  ulTaskList.innerHTML = ''
  var num = dataSnapshot.size
  //var num = dataSnapshot.numChildren()
  taskCount.innerHTML = num + (num > 1 ? ' tarefas' : ' tarefa') + ':' //Exibe na interface o numero de tarefas
  dataSnapshot.forEach(function (item) {//Percorre todos os elementos
    var value = item.data()
    //var value = item.val()

    var li = document.createElement('li')//Cria um elemento do tipo li
    li.setAttribute('class', 'd-flex flex-wrap')//Define classes de estilização
    
    li.id = item.id// Define o Id do li como a chave da tarefa 
    //li.id = item.key// Define o Id do li como a chave da tarefa 

    var div_li = document.createElement('div');
    div_li.setAttribute('class', 'd-flex align-items-center justify-content-start gap-2 col-8')

    if(value.imgUrl) {
      var imgLi = document.createElement('img')//Cria um elemento img
      imgLi.src = value.imgUrl;
      imgLi.setAttribute('class', 'imgTask')//Define classes de estilização
      div_li.appendChild(imgLi)//Adiciona o span dentro de li
    }
    else {
      var icon_ck = document.createElement('i')//Cria um elemento img
      icon_ck.setAttribute('class', 'fas fa-check')//Define classes de estilização
      div_li.appendChild(icon_ck)//Adiciona o span dentro de li
    }


    var spanLi = document.createElement('span')//Cria um elemento tipo span
    spanLi.setAttribute('id', 'itemLista')
    spanLi.appendChild(document.createTextNode(`Tarefa: ${value.name} - Tempo estimado: ${value.tempo} hora(s)`))
    // spanLi.setAttribute('class', 'me-auto')
    div_li.appendChild(spanLi)//Adiciona o span dentro do LI

    var div_li2 = document.createElement('div')
    div_li2.setAttribute('class', 'd-flex align-items-center justify-content-end gap-2 col-4')

    var icon_excluir = document.createElement('i')//Cria um elemento img
    icon_excluir.setAttribute('class', 'fas fa-trash')//Define classes de estilização
  
    var liRemoveBtn = document.createElement('button')//Cria um botão para remoção da tarefa
    // liRemoveBtn.appendChild(document.createTextNode('Excluir')) //Define o texto do botão de exclusão
    liRemoveBtn.appendChild(icon_excluir)//Adiciona o icone no botao
    liRemoveBtn.setAttribute('onclick', 'removeTask(\"' + /*item.key*/ item.id + '\")') //Configura o onclick da remoção de tarefas
    liRemoveBtn.setAttribute('class', 'btn btn-sm btn-danger taskBtn') // Define classes de estilização para o botão de remoção
    liRemoveBtn.setAttribute('title', 'Excluir') 
    div_li2.appendChild(liRemoveBtn)//Adiciona o botão de remoção no li

    var icon_editar = document.createElement('i')//Cria um elemento img
    icon_editar.setAttribute('class', 'fas fa-pen')//Define classes de estilização

    var liUpdateBtn = document.createElement('button')//Cria um botão para remoção da tarefa
    liUpdateBtn.appendChild(icon_editar)//Adiciona o icone no botao
    // liUpdateBtn.appendChild(document.createTextNode('Editar'))//Define o texto do botão de Editar
    liUpdateBtn.setAttribute('onclick', 'updateTask(\"' + /*item.key*/item.id + '\")')//Configura o onclick da atualização de tarefas
    liUpdateBtn.setAttribute('class', 'btn btn-sm btn-warning taskBtn')// Define classes de estilização para o botão de atualização
    liUpdateBtn.setAttribute('title', 'Editar') 
    div_li2.appendChild(liUpdateBtn)//Adiciona o botão de atualização no li



    li.appendChild(div_li)//Adiciona o Div
    li.appendChild(div_li2)//Adiciona o Div

    ulTaskList.appendChild(li) //Adiciona o li dentro da lista de tarefas
    
  })
}

//Remove tarefas do banco de dados
function removeTask(key) {

  var elemento = document.getElementById(key);

  // var taskName = document.querySelector('#' + key + ' > span')
  var taskName = elemento.getElementsByTagName('span')[0];
  var taskImg = elemento.getElementsByTagName('img')[0];

  var confirmation = confirm('Você deseja remover a tarefa \"' + taskName.innerHTML + '\" ?')
  if (confirmation) {
      dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(key).delete().then(function(){
      console.log('Tarefa "' + taskName.innerHTML + '" removida com sucesso')
      
      if(taskImg) 
          removeFile(taskImg.src)

    }).catch(function (error) {
      showError('Falha ao remover tarefa: ', error)
    })

    /*dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().then(function () {
      console.log('Tarefa "' + taskName.innerHTML + '" removida com sucesso')
      removeFile(taskImg.src)
    }).catch(function (error) {
      showError('Falha ao remover tarefa: ', error)
    })*/
  }
}

//Remove arquivos
function removeFile(imgUrl){
  console.log(imgUrl)
//Verifica se o imgUrl contém a imagem padrão de tarefas
  var result = imgUrl.indexOf('img/defaultTask.png')
  console.log(result)
//Se não for a imagem padrão de tarefas faça...
  if (result == -1){
    firebase.storage().refFromURL(imgUrl).delete().then(function(){
      console.log('Arquivo foi removido com sucesso')
    }).catch(function(error){
      console.log('Falha ao remover arquivo')
      console.log(error)
    })
  }else{//Se imgUrl representa a imagem padrao de tarefas, faça....
    console.log('Nenhum arquivo removido')
  }
}

// Prepara a atualização de tarefas
var updateTaskKey = null
function updateTask(key){
  updateTaskKey = key //Atribui o conteúdo de key dentro de uma variável global
  var taskName = document.getElementById(key);
  var content = taskName.getElementsByTagName('span')[0].innerHTML;
  taskFormTitle.innerHTML = '<strong> Editar a tarefa: </strong>' + content;
  taskForm.name.value = content;

  hideItem(taskForm.submitTaskForm)
  showItem(cancelUpdateTask)
}

//Restaura o estado inicial do formulário de tarefas
function resetTaskForm(){
  taskFormTitle.innerHTML = 'Adicionar tarefa: '
  hideItem(cancelUpdateTask)
  taskForm.submitTaskForm.style.display = 'initial'
  taskForm.name.value =''
  taskForm.file.value=''
  taskForm.desc.value = ''
}

//Confirmação da atualização de tarefas
function confirmTaskUpdate(){

  if (taskForm.name.value != ''){
    var taskImg = document.querySelector('#' + updateTaskKey + ' > img')
    var file = taskForm.file.files[0]//Seleciona o primeiro arquivo da seleção de arquivos 
    if (file != null) {//Verifiva se o arquivo foi selecionado

      if(file.size > 1024 * 1024 * 2){
        alert('A imagem não pode ser maior que 2MB. A imagem selecionada tem ' + (file.size / 1024 / 1024).toFixed(3) + 'MB')
        return
      }

      hideItem(cancelUpdateTask)

      if (file.type.includes('image')) {//Verifica se o arquivo é uma imagem
        //Compõe o nome do arquivo
        var imgName = firebase.database().ref().push().updateTaskKey + '-' + file.name
        //Compõe o caminho do arquivo
        var imgPath = 'taskListFiles/' + firebase.auth().currentUser.uid + '/' + imgName
        //Cria uma referencia de arquivo usando o caminho criado na linha acima
        var storageRef = firebase.storage().ref(imgPath)
        //Inicia o processo de upload  
        var upload = storageRef.put(file)

        trackUpload(upload).then(function(){
          storageRef.getDownloadURL().then(function(downloadURL){
            var data = {
              imgUrl: downloadURL, 
              name: taskForm.name.value,
              nameLowerCase: taskForm.name.value.toLowerCase()
            }

                  
            completeTaskUpdate(data, taskImg.src)  //Completa a atualização de tarefas    
          })
        }).catch(function(error){
          showError('Falha ao atualizar tarefa: ', error)
        })
     
      }else{
        alert('O arquivo selecionado precisa ser uma imagem!')
      }

    }else{//Nenhuma imagem for selecionada
      var data = {
        name: taskForm.name.value,
        nameLowerCase: taskForm.name.value.toLowerCase()
      }
     
      completeTaskUpdate(data)  //Completa a atualização de tarefas    
    }
  }else{
    alert('O nome da tarefa não pode ser vazio')
  }
}

//Completa a atualização de tarefas (persiste as informações no banco de dados)
function completeTaskUpdate(data, imgUrl){
  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(updateTaskKey).update(data).then(function(){
    console.log('Tarefa "' + data.name + '"atualizada com sucesso')
    if(imgUrl){
      removeFile(imgUrl)//Remove a imagem antiga
    }
  }).catch(function (error) {
    showError('Falha ao atualizar tarefa: ', error)
  })
  
  /*dbRefUsers.child(firebase.auth().currentUser.uid).child(updateTaskKey).update(data).then(function () {
    console.log('Tarefa "' + data.name + '"atualizada com sucesso')
    if(imgUrl){
      removeFile(imgUrl)//Remove a imagem antiga
    }
  }).catch(function (error) {
    showError('Falha ao atualizar tarefa: ', error)
  })*/
  resetTaskForm()//Restaura o formulário de tarefas
}