# Exemplos e Casos de Uso

Esta página descreve os principais fluxos funcionais do sistema, do ponto de vista do gestor institucional que utiliza o sistema no dia a dia.

---

## 1. Cadastro de gestor (realizado pelo administrador)

O auto-cadastro público foi removido. Apenas o administrador do sistema pode criar novos gestores.

Fluxo esperado:

1. administrador acessa a página **Gestão de Usuários** (`/usuarios`);
2. clica em **Novo Usuário**;
3. preenche SIAPE, nome completo, e-mail, senha inicial e seleciona o cargo:
   - **Gestor**: acessa o sistema e gerencia riscos, mas não pode adicionar ou remover membros de equipe;
   - **Gestor Administrador**: mesmos acessos do Gestor, mais a capacidade de gerenciar membros da equipe em sua unidade;
4. seleciona um ou mais setores/unidades;
5. conclui o cadastro;
6. o gestor recebe a senha inicial e pode alterá-la em **Editar Perfil**.

---

## 2. Login

Fluxo esperado:

1. informar SIAPE e senha;
2. autenticar no sistema;
3. ser redirecionado para o dashboard principal.

---

## 3. Recuperação de senha

Fluxo esperado:

1. acessar "Esqueci minha senha" na tela de login;
2. informar o e-mail cadastrado;
3. receber o código de verificação por e-mail;
4. inserir o código no sistema;
5. cadastrar a nova senha.

O código expira em 1 minuto. Se expirar, o fluxo deve ser reiniciado.

---

## 4. Criação de plano de risco

Fluxo esperado:

1. acessar "Novo Plano" na listagem de planos;
2. selecionar o desafio e objetivo estratégico do PDI;
3. selecionar o macroprocesso relacionado;
4. informar categoria, evento, causa e consequência do risco;
5. avaliar probabilidade e impacto (escala 1 a 5) para calcular o nível inerente;
6. descrever os controles atuais e sua eficácia;
7. avaliar probabilidade e impacto residuais para calcular o nível residual;
8. registrar o plano de ação: tipo de resposta, responsável, datas e descrição;
9. salvar o plano.

O sistema calcula automaticamente `nivel_risco = probabilidade × impacto` e `nivel_residual = prob_residual × imp_residual`.

---

## 5. Visualização e edição de plano de risco

Fluxo esperado:

1. acessar a listagem de planos;
2. usar os filtros de setor, categoria, período ou busca textual;
3. clicar em um plano para visualizar os detalhes;
4. se o setor do plano pertencer ao usuário, o botão "Editar Plano" fica disponível;
5. editar e salvar as alterações.

Gestores de outros setores podem visualizar, mas não editar.

---

## 6. Exportação de relatório

Fluxo esperado:

1. acessar a tela de visualização de um plano;
2. clicar em **PDF** para baixar o plano individual em PDF;
3. clicar em **Excel** para baixar o plano individual em planilha;
4. na listagem de planos, usar o botão de exportação para baixar todos os planos filtrados em Excel.

---

## 7. Dashboard gerencial

**Para gestores comuns:**

1. acessar o dashboard;
2. visualizar os cards de resumo: total de planos, riscos críticos, tratamentos ativos;
3. aplicar filtros por setor/unidade, período ou busca textual;
4. analisar a lista consolidada de planos com datas e status de tratamento.

**Para administradores (superusuário):**

1. acessar o dashboard — o sistema exibe o **Painel Administrativo** automaticamente;
2. visualizar estatísticas globais: gestores cadastrados, total de planos, riscos críticos;
3. usar os atalhos para navegar rapidamente às áreas de gestão: usuários, unidades, planos e mapa de riscos.

---

## 8. Mapa de riscos

Fluxo esperado:

1. acessar o mapa de riscos;
2. visualizar a matriz de probabilidade × impacto residual;
3. analisar a distribuição de riscos por categoria;
4. consultar o ranking de unidades com maior exposição;
5. revisar os riscos prioritários listados abaixo da matriz;
6. aplicar filtros por setor ou categoria para refinar a análise.

---

## 9. Gestão de equipe

Fluxo esperado:

1. acessar a tela "Equipe";
2. selecionar o setor desejado (para usuários vinculados a múltiplos setores);
3. visualizar os membros atuais;
4. adicionar um novo membro informando o SIAPE;
5. remover um membro existente.

Apenas gestores vinculados ao setor podem gerenciar a equipe daquele setor.

---

## 10. Monitoramento de risco

Fluxo esperado:

1. acessar a visualização de um plano de risco;
2. registrar um monitoramento informando os resultados observados, ações futuras e análise crítica;
3. acompanhar se o risco está sendo tratado conforme o plano de ação.

O sistema indica na dashboard e no mapa se o risco possui monitoramento registrado.

---

## 11. Administração de unidades (superusuário)

Fluxo esperado:

1. acessar a tela "Unidades" (visível apenas para superusuários);
2. buscar unidades por nome, sigla ou centro;
3. visualizar e editar os dados de cada unidade organizacional;
4. importar unidades oficiais via comando de management:

```bash
python manage.py importar_unidades_ufsm
```
