
import { useState, useEffect } from 'react';

// Lista das principais cidades por estado (baseada no IBGE)
const CITIES_BY_STATE = {
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó'],
  'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Ilhéus', 'Itabuna', 'Lauro de Freitas', 'Jequié', 'Teixeira de Freitas'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Crato', 'Maracanaú', 'Maranguape', 'Iguatu', 'Quixadá', 'Canindé'],
  'DF': ['Brasília', 'Gama', 'Taguatinga', 'Ceilândia', 'Sobradinho'],
  'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama', 'Itumbiara'],
  'MA': ['São Luís', 'Imperatriz', 'Caxias', 'Timon', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Primavera do Leste', 'Barra do Garças'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Maracaju', 'Aquidauana'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Bragança', 'Altamira'],
  'PB': ['ÁGUA BRANCA', 'AGUIAR', 'AMPARO', 'APARECIDA', 'AREIA DE BARAÚNAS', 'ASSUNÇÃO', 'BANANEIRAS', 'BARAÚNA', 'BARRA DE SÃO MIGUEL', 'BELÉM DO BREJO DO CRUZ', 'BERNARDINO BATISTA', 'BOQUEIRÃO', 'BOA VENTURA', 'BOA VISTA', 'BOM JESUS', 'BOM SUCESSO', 'BONITO DE SANTA FÉ', 'BREJO DO CRUZ', 'BREJO DOS SANTOS', 'CABACEIRAS', 'CACHOEIRA DOS ÍNDIOS', 'CACIMBA DE AREIA', 'CACIMBAS', 'CAJAZEIRAS', 'CAJAZEIRINHAS', 'CAMALAÚ', 'CARRAPATEIRA', 'CONCEIÇÃO', 'CONDADO', 'COREMAS', 'CURRAL VELHO', 'CATOLÉ DO ROCHA', 'DESTERRO', 'DIAMANTE', 'EMAS', 'IBIARA', 'ITAPORANGA', 'JERICÓ', 'JOCA CLAUDINO', 'JURU', 'LAGOA', 'LAGOA SECA', 'LASTRO', 'MALTA', 'MANAÍRA', 'MARIZÓPOLIS', 'MATO GROSSO', 'MATURÉIA', 'NAZAREZINHO', 'NOVA OLINDA', 'PASSAGEM', 'PATOS', 'PAULISTA', 'PEDRA BRANCA', 'PEDRA LAVRADA', 'PIANCÓ', 'POÇO DANTAS', 'POÇO DE JOSÉ DE MOURA', 'POMBAL', 'PRATA', 'QUIXABA', 'RIACHO DE SANTO ANTÔNIO', 'RIACHO DOS CAVALOS', 'SALGADINHO', 'SANTA CRUZ', 'SANTANA DOS GARROTES', 'SANTANA DE MANGUEIRA', 'SÃO BENTO', 'SÃO BENTINHO', 'SÃO DOMINGOS', 'SÃO FRANCISCO', 'SÃO JOÃO DO RIO DO PEIXE', 'SÃO JOSÉ DE CAIANA', 'SÃO JOSÉ DE PIRANHAS', 'SÃO JOSÉ DE PRINCESA', 'SÃO JOSÉ DO BREJO DO CRUZ', 'SÃO JOSÉ DO SABUGI', 'SERRA GRANDE', 'TAVARES', 'TEIXEIRA', 'TRIUNFO', 'UIRAÚNA', 'VÁRZEA', 'VIEIRÓPOLIS', 'VISTA SERRANA'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'Oeiras', 'Esperantina', 'Pedro II'],
  'RJ': ['ANGRA DOS REIS', 'ARARUAMA', 'AREAL', 'ARMAÇÃO DOS BÚZIOS', 'ARRAIAL DO CABO', 'BARRA DO PIRAÍ', 'BARRA MANSA', 'BELFORD ROXO', 'BOM JARDIM', 'BOM JESUS DO ITABAPOANA', 'CABO FRIO', 'CACHOEIRAS DE MACACU', 'CAMBUCI', 'CAMPOS DOS GOYTACAZES', 'CANTAGALO', 'CARAPEBUS', 'CARDOSO MOREIRA', 'CARMO', 'CASIMIRO DE ABREU', 'COMENDADOR LEVY GASPARIAN', 'CONCEIÇÃO DE MACABU', 'CORDEIRO', 'DUAS BARRAS', 'DUQUE DE CAXIAS', 'ENGENHEIRO PAULO DE FRONTIN', 'GUAPIMIRIM', 'IGUABA GRANDE', 'ITABORAÍ', 'ITAGUAÍ', 'ITALVA', 'ITAOCARA', 'ITAPERUNA', 'ITATIAIA', 'JAPERI', 'LAJE DO MURIAÉ', 'MACAÉ', 'MACUCO', 'MAGÉ', 'MANGARATIBA', 'MARICÁ', 'MENDES', 'MIGUEL PEREIRA', 'MIRACEMA', 'NATIVIDADE', 'NILÓPOLIS', 'NITERÓI', 'NOVA FRIBURGO', 'NOVA IGUAÇU', 'PARACAMBI', 'PARAÍBA DO SUL', 'PARATI', 'PATY DO ALFERES', 'PETRÓPOLIS', 'PINHEIRAL', 'PIRAÍ', 'PORCIÚNCULA', 'PORTO REAL', 'QUATIS', 'QUEIMADOS', 'QUISSAMÃ', 'RESENDE', 'RIO BONITO', 'RIO CLARO', 'RIO DAS FLORES', 'RIO DAS OSTRAS', 'RIO DE JANEIRO', 'SANTA MARIA MADALENA', 'SANTO ANTÔNIO DE PÁDUA', 'SÃO FIDÉLIS', 'SÃO FRANCISCO DE ITABAPOANA', 'SÃO GONÇALO', 'SÃO JOÃO DA BARRA', 'SÃO JOÃO DE MERITI', 'SÃO JOSÉ DE UBÁ', 'SÃO JOSÉ DO VALE DO RIO PRETO', 'SÃO PEDRO DA ALDEIA', 'SÃO SEBASTIÃO DO ALTO', 'SAPUCAIA', 'SAQUAREMA', 'SEROPÉDICA', 'SILVA JARDIM', 'SUMIDOURO', 'TANGUÁ', 'TERESÓPOLIS', 'TRAJANO DE MORAIS', 'TRÊS RIOS', 'VALENÇA', 'VARRE-SAI', 'VASSOURAS', 'VOLTA REDONDA'],
  'RN': ['ACARI', 'AÇU', 'AFONSO BEZERRA', 'ÁGUA NOVA', 'ALEXANDRIA', 'ALMINO AFONSO', 'ALTO DO RODRIGUES', 'ANGICOS', 'ANTÔNIO MARTINS', 'APODI', 'AREIA BRANCA', 'ARÊS', 'AUGUSTO SEVERO', 'BAÍA FORMOSA', 'BARAÚNA', 'BARCELONA', 'BENTO FERNANDES', 'BODÓ', 'BOM JESUS', 'BREJINHO', 'CAIÇARA DO NORTE', 'CAIÇARA DO RIO DO VENTO', 'CAICÓ', 'CAMPO GRANDE', 'CAMPO REDONDO', 'CANGUARETAMA', 'CARAÚBAS', 'CARNAÚBA DOS DANTAS', 'CARNAUBAIS', 'CEARÁ-MIRIM', 'CERRO CORÁ', 'CORONEL EZEQUIEL', 'CORONEL JOÃO PESSOA', 'CRUZETA', 'CURRAIS NOVOS', 'DOUTOR SEVERIANO', 'ENCANTO', 'EQUADOR', 'ESPÍRITO SANTO', 'EXTREMOZ', 'FELIPE GUERRA', 'FERNANDO PEDROZA', 'FLORÂNIA', 'FRANCISCO DANTAS', 'FRUTUOSO GOMES', 'GALINHOS', 'GOIANINHA', 'GOVERNADOR DIX-SEPT ROSADO', 'GROSSOS', 'GUARACIABA DO NORTE', 'IPANGUAÇU', 'IPUEIRA', 'ITAÚ', 'JAÇANÃ', 'JANDAÍRA', 'JANDUÍS', 'JANUÁRIO CICCO', 'JAPI', 'JARDIM DE ANGICOS', 'JARDIM DE PIRANHAS', 'JARDIM DO SERIDÓ', 'JOÃO CÂMARA', 'JOÃO DIAS', 'JOSÉ DA PENHA', 'JUCURUTU', 'JUNDIA', 'LAGOA D\'ANTA', 'LAGOA DE PEDRAS', 'LAGOA DE VELHOS', 'LAGOA NOVA', 'LAGOA SALGADA', 'LAJES', 'LAJES PINTADAS', 'LUCRÉCIA', 'LUÍS GOMES', 'MACAÍBA', 'MACAU', 'MAJOR SALES', 'MARCELINO VIEIRA', 'MARTINS', 'MAXARANGUAPE', 'MESSIAS TARGINO', 'MONTANHAS', 'MONTE ALEGRE', 'MONTE DAS GAMELEIRAS', 'MOSSORÓ', 'NATAL', 'NÍSIA FLORESTA', 'NOVA CRUZ', 'OLHO-D\'ÁGUA DO BORGES', 'OURO BRANCO', 'PARANÁ', 'PARAÚ', 'PARAZINHO', 'PARELHAS', 'PARNAMIRIM', 'PASSA E FICA', 'PASSAGEM', 'PATU', 'PAU DOS FERROS', 'PEDRA GRANDE', 'PEDRA PRETA', 'PEDRO AVELINO', 'PEDRO VELHO', 'PENDÊNCIAS', 'PILÕES', 'POÇO BRANCO', 'PORTALEGRE', 'PORTO DO MANGUE', 'PUREZA', 'RAFAEL FERNANDES', 'RAFAEL GODEIRO', 'RIACHO DA CRUZ', 'RIACHO DE SANTANA', 'RIACHUELO', 'RODOLFO FERNANDES', 'RUY BARBOSA', 'SANTA CRUZ', 'SANTA MARIA', 'SANTANA DO MATOS', 'SANTANA DO SERIDÓ', 'SANTO ANTÔNIO', 'SÃO BENTO DO NORTE', 'SÃO BENTO DO TRAIRÍ', 'SÃO FERNANDO', 'SÃO FRANCISCO DO OESTE', 'SÃO GONÇALO DO AMARANTE', 'SÃO JOÃO DO SABUGI', 'SÃO JOSÉ DE MIPIBU', 'SÃO JOSÉ DO CAMPESTRE', 'SÃO JOSÉ DO SERIDÓ', 'SÃO MIGUEL', 'SÃO MIGUEL DO GOSTOSO', 'SÃO PAULO DO POTENGI', 'SÃO PEDRO', 'SÃO RAFAEL', 'SÃO TOMÉ', 'SÃO VICENTE', 'SENADOR ELÓI DE SOUZA', 'SENADOR GEORGINO AVELINO', 'SERRA CAIADA', 'SERRA DE SÃO BENTO', 'SERRA DO MEL', 'SERRA NEGRA DO NORTE', 'SERRINHA', 'SERRINHA DOS PINTOS', 'SEVERIANO MELO', 'SÍTIO NOVO', 'TABOLEIRO GRANDE', 'TAIPU', 'TANGARÁ', 'TENENTE ANANIAS', 'TENENTE LAURENTINO CRUZ', 'TIBAU', 'TIBAU DO SUL', 'TIMBAÚBA DOS BATISTAS', 'TOUROS', 'TRIUNFO POTIGUAR', 'UMARIZAL', 'UPANEMA', 'VÁRZEA', 'VENHA-VER', 'VERA CRUZ', 'VIÇOSA', 'VILA FLOR'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Cacoal', 'Vilhena', 'Rolim de Moura', 'Jaru', 'Guajará-Mirim', 'Ouro Preto do Oeste', 'Espigão d\'Oeste'],
  'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí', 'Pacaraima', 'São João da Baliza', 'São Luiz', 'Bonfim', 'Cantá'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça'],
  'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Sorocaba', 'Ribeirão Preto', 'Santos', 'Mauá'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Propriá', 'Canindé de São Francisco'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Guaraí', 'Formoso do Araguaia', 'Tocantinópolis', 'Miracema do Tocantins']
};

// Função para normalizar strings para comparação
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' '); // Normaliza espaços
};

// Função para padronizar cidade
const standardizeCity = (input: string, state: string): string => {
  const cities = CITIES_BY_STATE[state as keyof typeof CITIES_BY_STATE] || [];
  const normalizedInput = normalizeString(input);
  
  // Procurar correspondência exata
  const exactMatch = cities.find(city => 
    normalizeString(city) === normalizedInput
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Procurar correspondência parcial
  const partialMatch = cities.find(city => 
    normalizeString(city).includes(normalizedInput) ||
    normalizedInput.includes(normalizeString(city))
  );
  
  if (partialMatch) {
    return partialMatch;
  }
  
  // Se não encontrar correspondência, retornar o input formatado
  return input
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

export const useCityData = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCitiesForState = (state: string) => {
    setLoading(true);
    
    // Simular carregamento assíncrono
    setTimeout(() => {
      const stateCities = CITIES_BY_STATE[state as keyof typeof CITIES_BY_STATE] || [];
      setCities(stateCities);
      setLoading(false);
    }, 100);
  };

  const searchCities = (query: string, state: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const stateCities = CITIES_BY_STATE[state as keyof typeof CITIES_BY_STATE] || [];
    const normalizedQuery = normalizeString(query);
    
    return stateCities.filter(city => 
      normalizeString(city).includes(normalizedQuery)
    ).slice(0, 10); // Limitar a 10 resultados
  };

  return {
    cities,
    loading,
    loadCitiesForState,
    searchCities,
    standardizeCity
  };
};
