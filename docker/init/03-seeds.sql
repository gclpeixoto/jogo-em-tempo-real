SET search_path TO jogo;


INSERT INTO grupo_perguntas (nome, descricao) VALUES
('Geral', 'Perguntas variadas do MVP'),
('Matemática', 'Perguntas relacionadas a cálculos e números'),
('Cultura Geral', 'Perguntas sobre história, geografia e arte');


INSERT INTO pergunta (
    id_grupo, texto,
    alternativa_a, alternativa_b, alternativa_c, alternativa_d,
    resposta_correta
) VALUES

-- 1
(1,
 'Qual das afirmações a seguir está CORRETA em relação aos conceitos fundamentais de Conjuntos?',
 'Um conjunto é um agrupamento de objetos que não precisam ser bem definidos.',
 'Os elementos de um conjunto são geralmente indicados por letras maiúsculas (A, B, C).',
 'A notação X ∈ A significa que o elemento X pertence ao conjunto A.',
 'O conjunto que não possui elementos é chamado de conjunto unitário.',
 'C'),

-- 2
(1,
 'Dados os conjuntos A={1, 2, 3, 4} e B={1, 2}, qual proposição é VERDADEIRA?',
 'A ⊆ B (A é subconjunto de B).',
 'A ⊂ B (A é subconjunto próprio de B).',
 'O conjunto vazio (∅) não é subconjunto de B.',
 'B ⊆ A (B é subconjunto de A).',
 'D'),

-- 3
(1,
 'Sejam M={a, b, c, d} e N={c, d, e, f}. Qual é o resultado da União (M ∪ N)?',
 '{c, d}',
 '{a, b, e, f}',
 '{a, b, c, d, e, f}',
 '{a, b}',
 'C'),

-- 4
(1,
 'Considerando os conjuntos A={5,10,15,20} e B={15,20,25,30}, qual é o conjunto resultante da Interseção (A ∩ B)?',
 '{5,10,15,20,25,30}',
 '{5,10,25,30}',
 '{15,20}',
 '∅',
 'C'),

-- 5
(1,
 'Sejam X={x ∈ N / x ≤ 8} e Y={x ∈ N / x é par e x < 10}. Qual é o conjunto diferença (X−Y)?',
 '{0,2,4,6,8}',
 '{1,3,5,7}',
 '∅',
 '{1,2,3,4,5,6,7,8,9}',
 'B'),

-- 6
(1,
 'Considere o conjunto A={10,{20},30}. Qual é a sequência CORRETA de julgamentos para: I. 10 ∈ A, II. 20 ∈ A, III. {20} ⊂ A, IV. {10} ⊆ A?',
 'V, F, F, V',
 'F, V, V, F',
 'V, F, V, F',
 'V, V, F, V',
 'A'),

-- 7
(1,
 'Dados P={0,1,2,3}, Q={2,3,4,5} e R={0,5}. Qual é o resultado de (P ∪ Q) − R?',
 '{0,5}',
 '{1,2,3,4}',
 '{2,3}',
 '{0,1,2,3,4,5}',
 'B'),

-- 8
(1,
 'O conjunto S={Ana, Bruno, Carla, David, Eduarda} possui quantos subconjuntos?',
 '5',
 '10',
 '32',
 '64',
 'C');
