
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
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Mamanguape'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Campo Maior', 'Barras', 'Oeiras', 'Esperantina', 'Pedro II'],
  'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Campos dos Goytacazes', 'Belford Roxo', 'São João de Meriti', 'Petrópolis', 'Volta Redonda'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Açu', 'Currais Novos', 'Nova Cruz'],
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
