
export const useOpeningHours = () => {
  const generateTimeSlots = (openingHours: any) => {
    // Horário padrão se não houver configuração
    const defaultHours = {
      start: '08:00',
      end: '18:00'
    };

    // Extrair horários (assumindo que openingHours tem formato similar)
    let startTime = defaultHours.start;
    let endTime = defaultHours.end;

    if (openingHours && typeof openingHours === 'object') {
      // Tentar extrair horários do primeiro dia disponível
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        if (openingHours[day] && !openingHours[day].closed) {
          startTime = openingHours[day].open || startTime;
          endTime = openingHours[day].close || endTime;
          break;
        }
      }
    }

    const slots: string[] = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    let current = start;
    while (current < end) {
      slots.push(formatTime(current));
      current += 30; // Incrementar 30 minutos
    }

    return slots;
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return {
    generateTimeSlots,
    parseTime,
    formatTime
  };
};
