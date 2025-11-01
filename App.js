import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Animated, 
  Alert, Modal, image, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [input, setInput] = useState("");
  const [nomes, setNomes] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [mostrandoResultado, setMostrandoResultado] = useState(false); 
  const [historico, setHistorico] = useState([]);
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [editandoTexto, setEditandoTexto] = useState("");
  const [modalVisivel, setModalVisivel] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    carregarHistorico();
  }, []);

  const salvarHistorico = async (novoHistorico) => {
    try {
      await AsyncStorage.setItem("historico", JSON.stringify(novoHistorico));
    } catch (error) {
      console.log("Erro ao salvar:", error);
    }
  };

  const carregarHistorico = async () => {
    try {
      const data = await AsyncStorage.getItem("historico");
      if (data) {
        const historicoData = JSON.parse(data);
        setHistorico(historicoData);
        
        if (historicoData.length > 0) {
          setResultado(historicoData[0]);
        }
      }
    } catch (error) {
      console.log("Erro ao carregar:", error);
    }
  };

  const adicionarNome = () => {
    if (input.trim() === "") return;
    const numero = parseInt(input.trim(), 10);
  
    if (!isNaN(numero) && numero > 0) {
      const numerosGerados = Array.from({ length: numero }, (_, i) => (i + 1).toString());
      setNomes([...nomes, ...numerosGerados]);
    } else {
      setNomes([...nomes, input.trim()]);
    }
    setInput("");
  };

  const editarNome = () => {
    if (editandoTexto.trim() === "") return;
    const novosNomes = [...nomes];
    novosNomes[editandoIndex] = editandoTexto.trim();
    setNomes(novosNomes);
    setModalVisivel(false);
  };

  const excluirNome = (index) => {
    const novosNomes = nomes.filter((_, i) => i !== index);
    setNomes(novosNomes);
  };

  const sortear = () => {
    if (nomes.length === 0) {
      Alert.alert("Atenção","Adicione nomes ou numero ex:10 = 1 ao 10, sem a necessidade de digitar um por um, antes de clicar em SORTEAR!");
      return;
    }
    const escolhido = nomes[Math.floor(Math.random() * nomes.length)];
    setMostrandoResultado(false);

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 10,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setResultado(escolhido);
      setMostrandoResultado(true);
      setResultado(escolhido);
      const novoHistorico = [escolhido, ...historico];
      setHistorico(novoHistorico);
      salvarHistorico(novoHistorico);
    });
  };

  const limparHistorico = () => {
    Alert.alert("Confirmação", "Limpar histórico?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          setHistorico([]);
          setResultado(null);
          await AsyncStorage.removeItem("historico");
        },
      },
    ]);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <ImageBackground 
  source={require('./assets/fundo.png')}
  style={[ styles.backgroundImage,
    {
      opacity: 1, 
      transform: [
        { scale: 1.0 }, 
        { translateX: 0 }, 
        { translateY: 0 }, 
      ]
    }
  ]}
  resizeMode="cover"
>
    <View style={styles.overlay}>
      <Text style={styles.titulo}>🎁 Sorteio Digital 🎁</Text>

    <View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    placeholder="Nome ou Nº(ex:20 = 1 a 20)"
    placeholderTextColor="#444"
    value={input}
    onChangeText={setInput}
    onSubmitEditing={adicionarNome}
  />
  <TouchableOpacity style={styles.addButton} onPress={adicionarNome}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>
</View>

      <FlatList
        data={nomes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.nomeItem}>
            <Text style={styles.nomeTexto} numberOfLines={1} ellipsizeMode="tail">{item}  </Text>
            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={styles.editarButton}
                onPress={() => {
                  setEditandoIndex(index);
                  setEditandoTexto(item);
                  setModalVisivel(true);
                }}
              >
                <Text style={styles.editarButtonText}>✒️</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.excluirButton}
                onPress={() => excluirNome(index)}
              >
                <Text style={styles.excluirButtonText}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botaoSortear} onPress={sortear}>
        <Text style={styles.botaoSortearTexto}>🎰🎲  Sortear  🎲🎰</Text>
      </TouchableOpacity>

<Animated.View style={[styles.resultadoBox, { transform: [{ rotate: spin }] }]}>
  {mostrandoResultado && resultado && (
    <Text style={styles.resultadoTexto}>🎉 Ganhador é: {resultado} 🎉</Text>
  )}
</Animated.View>

      <Text style={styles.subTitulo}>       📜  Ganhadores  📜</Text>
      <FlatList
        data={historico}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.historicoItem}>
            <Text style={styles.historicoTexto}>{item}</Text>
          </View>
        )}
      />

      {historico.length > 0 && (
        <TouchableOpacity style={styles.limparBotao} onPress={limparHistorico}>
          <Text style={styles.limparTexto}>🗑️ Limpar Histórico 🗑️</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisivel} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>         Editar nome</Text>
            <TextInput
              style={styles.modalInput}
              value={editandoTexto}
              onChangeText={setEditandoTexto}
              onSubmitEditing={editarNome}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.modalCancelar} onPress={() => setModalVisivel(false)}>
                <Text style={styles.modalTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSalvar} onPress={editarNome}>
                <Text style={styles.modalTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ImageBackground>                               
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
    paddingTop: 50,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
    padding: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 26,//titulo
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#fff999",
    textShadowColor: 'green',
    textShadowRadius: 40
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: -14,
    borderWidth: 3,
    borderColor: "green",
    borderRadius: 14,
    backgroundColor: "orange",
    paddingHorizontal: 0,
  },
  
  input: {
    flex: 1,                 // ocupa todo espaço disponível
    height: 50,              // altura maior
    fontSize: 16,
    color: "#000",
    paddingHorizontal: 1,   // espaço interno
    textAlign: "center",     // centraliza o texto digitado
  },
  addButton: {
    marginLeft: 12,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 50,   // largura fixa para não invadir input
    height: 50,  // altura igual ao input
  },
  
  addButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  nomeItem: {
    backgroundColor: "#E0F2FE",//campo com nome/editar e excluir
    padding: 10,
    borderRadius: 12,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3
  },
  nomeTexto: {
    fontSize: 16,//fonte dos nomes ou n°
    color: "#075985",
  },
  botaoSortear: {//botao sortear
    backgroundColor: "#075985",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  botaoSortearTexto: {//texto sortear
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  resultadoBox: {//campo do resultado
    backgroundColor: "#999885",
    padding: 12,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: "#4a00e2"
  },
  resultadoTexto: {//nome do ganhador
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subTitulo: {//palavra ganhadores
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 5,
    color: "#fff900",
    borderWidth: 2,
    borderRadius: 18,
  //borderColor: "green",
  textShadowColor: 'green',
  textShadowRadius: 30,
  textShadowOffset: { width: -5, height: 0 },
  },
  historicoItem: {//distancia dos historico
    backgroundColor: "#9E999B",
    padding: 10,
    borderRadius: 14,
    marginVertical: 2,
    borderWidth: 2,
  borderColor: "red"
  },
  historicoTexto: {//fonte dos historicos
    fontSize: 16,
    color: "#334155",
  },
  limparBotao: {
    marginTop: 12,//altura do historico
    backgroundColor: "#534185",
    padding: 12,
    borderRadius: 14,//botao limpar
    alignItems: "center",
    marginVertical: 18,
    borderWidth: 2
  },
  limparTexto: {// texto limpa historico
    color: "#ffD999",
    fontWeight: "bold",
  },
  botoesContainer: {//botoes editar e excluir
    flexDirection: 'row',
  },
  editarButton: {//botao editar
    backgroundColor: '#675985',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  editarButtonText: {//botao editar
    fontSize: 12,
    backgroundColor: "#675985",
  },
  excluirButton: {//botao excluir
    backgroundColor: "#777985",
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  excluirButtonText: {//botao excluir
    fontSize: 12,
    backgroundColor: "#777985",
  },
  modalContainer: {//posicao da janela editar
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {//janela editar nome
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  modalTitulo: {//janela editar nome
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,//campo editar 
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalBotoes: {//botoes cancelar e salvar
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelar: {//botao cancelar
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalSalvar: {//botao cancelar e salvar
    backgroundColor: '#16A34A',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalTexto: {//texto botao cancelar e salvar
    color: 'white',
    fontWeight: 'bold',
  },
});
