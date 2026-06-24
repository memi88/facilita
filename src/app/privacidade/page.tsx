import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/ui/legal-page";
import { PublicFooter } from "@/components/ui/public-footer";

export const metadata: Metadata = {
  title: "Política de Privacidade — Facilita",
  description:
    "Como o Facilita coleta, usa e protege seus dados e os dados de seus clientes, incluindo a integração com o Google Calendar."
};

const sections: LegalSection[] = [
  {
    id: "introducao",
    title: "Introdução",
    children: (
      <>
        <p>
          O Facilita é um produto da Idealogic, uma ferramenta de agendamento online que ajuda
          profissionais a gerenciar compromissos e disponibilidade, com sincronização opcional ao
          Google Calendar.
        </p>
        <p>
          Esta política explica quais dados coletamos, como usamos, com quem compartilhamos, e
          quais direitos o usuário tem. Ela se aplica a todos os usuários do Facilita, incluindo
          profissionais cadastrados e pessoas que agendam horários por uma página pública.
        </p>
      </>
    )
  },
  {
    id: "dados-coletados",
    title: "Quais dados coletamos",
    children: (
      <ul>
        <li>Dados de cadastro do Profissional: nome, e-mail, senha, telefone, profissão, nome público e slug.</li>
        <li>Dados de agendamento informados por Clientes: nome, e-mail e/ou telefone, horário e tipo de serviço.</li>
        <li>Dados do Google Calendar: e-mail da conta conectada, identificador do calendário e eventos necessários para verificação de disponibilidade e criação de compromissos.</li>
        <li>Dados técnicos: cookies de sessão e dados básicos de navegação para funcionamento e segurança.</li>
      </ul>
    )
  },
  {
    id: "uso-dados",
    title: "Como usamos os dados",
    children: (
      <ul>
        <li>Permitir login e operação da conta do Profissional.</li>
        <li>Exibir a página pública de agendamento e processar reservas feitas por Clientes.</li>
        <li>Sincronizar com o Google Calendar para verificar horários ocupados e criar novos eventos.</li>
        <li>Enviar comunicações operacionais relacionadas ao uso do serviço, quando aplicável.</li>
        <li>Não usamos os dados para publicidade, não vendemos dados a terceiros e não usamos dados do Google Calendar para treinar IA.</li>
      </ul>
    )
  },
  {
    id: "limited-use",
    title: "Uso de dados do Google",
    children: (
      <>
        <p>
          &quot;O uso e a transferência de informações recebidas das APIs do Google pelo Facilita
          aderem à Política de Dados do Usuário dos Serviços de API do Google, incluindo os
          requisitos de Uso Limitado (Limited Use).&quot;
        </p>
        <p>
          Os dados do Google Calendar são usados exclusivamente para a funcionalidade de
          agendamento dentro do Facilita. Esses dados não são compartilhados com terceiros, não
          são vendidos e não são usados para publicidade.
        </p>
      </>
    )
  },
  {
    id: "compartilhamento",
    title: "Compartilhamento de dados",
    children: (
      <ul>
        <li>Não vendemos dados pessoais.</li>
        <li>Dados de agendamento são visíveis ao Profissional correspondente para viabilizar o serviço.</li>
        <li>Podemos compartilhar dados com prestadores essenciais de infraestrutura, como AWS e Supabase.</li>
        <li>Podemos divulgar dados se exigido por lei ou ordem judicial.</li>
      </ul>
    )
  },
  {
    id: "seguranca",
    title: "Armazenamento e segurança",
    children: (
      <ul>
        <li>Os dados são armazenados em Supabase com proteção em trânsito e em repouso.</li>
        <li>Senhas são armazenadas com hashing seguro, nunca em texto plano.</li>
        <li>Tokens do Google são acessados apenas por rotinas internas do servidor.</li>
      </ul>
    )
  },
  {
    id: "revogar",
    title: "Como desconectar o Google Calendar",
    children: (
      <ul>
        <li>O Profissional pode remover a conexão no painel do sistema.</li>
        <li>Também pode revogar o acesso diretamente na conta Google em myaccount.google.com/permissions.</li>
        <li>Ao revogar, o Facilita deixa de conseguir ler ou criar eventos nessa agenda.</li>
      </ul>
    )
  },
  {
    id: "retencao",
    title: "Retenção e exclusão de dados",
    children: (
      <p>
        Os dados são mantidos enquanto a conta estiver ativa. O usuário pode solicitar exclusão da
        conta e dos dados associados pelo e-mail de suporte, exceto quando a retenção for exigida
        por obrigação legal.
      </p>
    )
  },
  {
    id: "direitos-lgpd",
    title: "Direitos do usuário",
    children: (
      <p>
        O usuário tem direito de acesso, correção, exclusão, portabilidade e revogação do
        consentimento dos dados pessoais, conforme a LGPD. As solicitações podem ser feitas pelo
        canal de contato abaixo.
      </p>
    )
  },
  {
    id: "contato",
    title: "Contato",
    children: (
      <p>
        E-mail de contato para privacidade e suporte:{" "}
        <a href="mailto:idealogic@idealogic.com.br">idealogic@idealogic.com.br</a>
      </p>
    )
  },
  {
    id: "alteracoes",
    title: "Alterações nesta política",
    children: (
      <p>
        Esta política pode ser atualizada periodicamente. A data de última atualização sempre
        fica visível no topo da página.
      </p>
    )
  }
];

export default function PrivacyPage() {
  return (
    <>
      <LegalPageLayout
        title="Política de Privacidade"
        description="Como o Facilita coleta, usa e protege seus dados e os dados de seus clientes, incluindo a integração com o Google Calendar."
        updatedAt="23 de junho de 2026"
        sections={sections}
      />
      <PublicFooter />
    </>
  );
}
