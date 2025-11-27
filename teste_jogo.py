import requests
import socketio
import time
import threading

BASE_URL = "http://localhost:3000"
ID_SALA = "cd76538f-a7d1-4e3e-961a-9001f4356921"

# ====================================================
#  FUNÇÃO PARA CRIAR UM JOGADOR VIA REST
# ====================================================
def criar_jogador(nome):
    resposta = requests.post(
        f"{BASE_URL}/salas/entrar",
        json={"idSala": ID_SALA, "nomeJogador": nome}
    )
    print(f"🔵 Criando jogador {nome}: {resposta.status_code}")
    print(resposta.text)
    data = resposta.json()
    return data["jogador"]["id_jogador"]


# ====================================================
#  CLASSE PARA CONTROLAR UM JOGADOR (SOCKET.IO)
# ====================================================
class JogadorThread(threading.Thread):

    def __init__(self, id_jogador, nome):
        super().__init__()
        self.id_jogador = id_jogador
        self.nome = nome
        self.sio = socketio.Client()

        @self.sio.event
        def connect():
            print(f"🟢 Socket conectado para {self.nome}")

        @self.sio.on("entrouNaSala")
        def entrouNaSala(data):
            print(f"📥 [{self.nome}] entrouNaSala:", data)

        @self.sio.on("jogadoresAtualizados")
        def jogadoresAtualizados(data):
            print(f"👥 [{self.nome}] jogadoresAtualizados:", data)

        @self.sio.on("novaPergunta")
        def novaPergunta(data):
            print(f"\n❓ [{self.nome}] NOVA PERGUNTA:")
            print(data)

            # pequena pausa para simulação
            time.sleep(1.2)

            # envia sempre "c" como alternativa
            print(f"✉️ [{self.nome}] respondendo 'c'")
            self.sio.emit("responder", {
                "idSala": ID_SALA,
                "idJogador": self.id_jogador,
                "alternativa": "c"
            })

        @self.sio.on("ponto")
        def ponto(data):
            print(f"🏅 [{self.nome}] ponto para:", data)

        @self.sio.on("fimDeJogo")
        def fimDeJogo(data):
            print(f"\n🏆 [{self.nome}] FIM DO JOGO!")
            print(data)
            self.sio.disconnect()

        @self.sio.event
        def disconnect():
            print(f"🔴 Socket desconectado para {self.nome}")

    def run(self):
        print(f"🔌 [{self.nome}] Conectando ao servidor WebSocket...")
        self.sio.connect("http://localhost:3000")

        print(f"➡️ [{self.nome}] Enviando evento entrarSala...")
        self.sio.emit("entrarSala", {
            "idSala": ID_SALA,
            "idJogador": self.id_jogador
        })

        self.sio.wait()


# ====================================================
#  FLUXO PRINCIPAL: CRIA DOIS JOGADORES E JOGA
# ====================================================

print("\n====================")
print("   INICIANDO TESTE   ")
print("====================\n")

# Criar dois jogadores via REST
id_jogador1 = criar_jogador("PythonPlayer1")
id_jogador2 = criar_jogador("PythonPlayer2")

# Criar dois sockets
player1 = JogadorThread(id_jogador1, "PythonPlayer1")
player2 = JogadorThread(id_jogador2, "PythonPlayer2")

# Iniciar os dois jogadores simultaneamente
player1.start()
time.sleep(0.5)   # pequena pausa para garantir ordem
player2.start()

# Esperar encerrar
player1.join()
player2.join()

print("\n🎉 TESTE COMPLETO — Script finalizado!\n")
