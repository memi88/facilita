import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/ui/legal-page";
import { PublicFooter } from "@/components/ui/public-footer";

export const metadata: Metadata = {
  title: "Termos de Serviço — Facilita",
  description: "Termos e condições de uso da plataforma Facilita para agendamento online."
};

const sections: LegalSection[] = [
  {
    id: "aceitacao",
    title: "Aceitação dos termos",
    children: (
      <p>
        Ao criar uma conta ou usar o Facilita, o Profissional concorda com estes Termos de
        Serviço. Caso não concorde, não deve utilizar o serviço.
      </p>
    )
  },
  {
    id: "descricao",
    title: "Descrição do serviço",
    children: (
      <p>
        O Facilita é uma plataforma de agendamento online operada pela Idealogic, que permite ao
        Profissional configurar uma agenda pública, definir serviços e horários disponíveis, e
        sincronizar com o Google Calendar.
      </p>
    )
  },
  {
    id: "conta",
    title: "Cadastro e responsabilidade pela conta",
    children: (
      <ul>
        <li>O Profissional é responsável por manter a confidencialidade de sua senha.</li>
        <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
        <li>O Facilita pode suspender contas que violem estes termos ou apresentem uso fraudulento.</li>
      </ul>
    )
  },
  {
    id: "uso-aceitavel",
    title: "Uso aceitável",
    children: (
      <ul>
        <li>É proibido usar o serviço para fins ilegais.</li>
        <li>É proibido enviar spam por meio da funcionalidade de agendamento.</li>
        <li>É proibido tentar acessar dados de outros usuários sem autorização.</li>
        <li>É proibido fazer automação ou scraping não autorizado da plataforma.</li>
      </ul>
    )
  },
  {
    id: "google",
    title: "Integração com o Google Calendar",
    children: (
      <ul>
        <li>A conexão com o Google Calendar é opcional e controlada pelo Profissional.</li>
        <li>O Profissional autoriza o Facilita a ler informações de disponibilidade e criar eventos em seu nome, exclusivamente para agendamento.</li>
        <li>O Profissional pode revogar essa integração a qualquer momento.</li>
      </ul>
    )
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade do serviço",
    children: (
      <p>
        O Facilita busca manter o serviço disponível de forma contínua, mas não garante operação
        ininterrupta. Manutenções e instabilidades de terceiros podem ocorrer.
      </p>
    )
  },
  {
    id: "responsabilidade",
    title: "Limitação de responsabilidade",
    children: (
      <ul>
        <li>O Facilita não se responsabiliza por conflitos causados por uso simultâneo de múltiplas ferramentas de calendário fora da plataforma.</li>
        <li>O Facilita não se responsabiliza por perda de dados decorrente de uso indevido da conta pelo próprio usuário.</li>
        <li>O Facilita não se responsabiliza por indisponibilidades de serviços de terceiros.</li>
      </ul>
    )
  },
  {
    id: "cancelamento",
    title: "Cancelamento e exclusão de conta",
    children: (
      <p>
        O Profissional pode encerrar sua conta a qualquer momento. Mediante solicitação, os dados
        serão excluídos conforme descrito na Política de Privacidade.
      </p>
    )
  },
  {
    id: "alteracoes",
    title: "Alterações no serviço e nos termos",
    children: (
      <p>
        O Facilita pode alterar funcionalidades e estes termos ao longo do tempo, com aviso
        razoável quando a mudança for relevante. O uso continuado após a alteração representa
        aceitação dos novos termos.
      </p>
    )
  },
  {
    id: "lei",
    title: "Lei aplicável",
    children: (
      <p>
        Estes termos são regidos pelas leis da República Federativa do Brasil, com foro eleito na
        comarca de Santa Cruz do Sul, RS.
      </p>
    )
  },
  {
    id: "contato",
    title: "Contato",
    children: (
      <p>
        Canal de contato: <a href="mailto:idealogic@idealogic.com.br">idealogic@idealogic.com.br</a>
      </p>
    )
  }
];

export default function TermsPage() {
  return (
    <>
      <LegalPageLayout
        title="Termos de Serviço"
        description="Termos e condições de uso da plataforma Facilita para agendamento online."
        updatedAt="23 de junho de 2026"
        sections={sections}
      />
      <PublicFooter />
    </>
  );
}
