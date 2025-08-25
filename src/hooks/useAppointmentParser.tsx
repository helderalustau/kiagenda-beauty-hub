import { useMemo } from 'react';

interface Service {
  name: string;
  duration: number;
  price: number;
  type: 'main' | 'additional';
}

interface ParsedAppointment {
  id: string;
  client: any;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: Service[];
  totalPrice: number;
  totalDuration: number;
  clientNotes: string;
}

export const useAppointmentParser = () => {
  const parseAdditionalServices = (notes: string): Service[] => {
    if (!notes) return [];
    
    const additionalServicesMatch = notes.match(/Serviços Adicionais:\s*(.+?)(?:\n\n|$)/s);
    if (!additionalServicesMatch) return [];
    
    const servicesText = additionalServicesMatch[1];
    const serviceMatches = servicesText.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/g);
    
    if (!serviceMatches) return [];
    
    return serviceMatches.map(match => {
      const parts = match.match(/([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([\d,]+(?:\.\d{2})?)\)/);
      if (!parts) return null;
      
      return {
        name: parts[1].trim(),
        duration: parseInt(parts[2]),
        price: parseFloat(parts[3].replace(',', '')),
        type: 'additional' as const
      };
    }).filter(Boolean) as Service[];
  };

  const getClientNotes = (notes: string): string => {
    if (!notes) return '';
    
    const additionalServicesIndex = notes.indexOf('Serviços Adicionais:');
    if (additionalServicesIndex === -1) return notes;
    
    return notes.substring(0, additionalServicesIndex).trim();
  };

  const parseAppointment = (appointment: any): ParsedAppointment => {
    console.log('🔍 parseAppointment - Appointment data:', appointment);
    
    const additionalServices = parseAdditionalServices(appointment.notes || '');
    const clientNotes = getClientNotes(appointment.notes || '');
    
    console.log('🔍 parseAppointment - Additional services:', additionalServices);
    console.log('🔍 parseAppointment - Client notes:', clientNotes);
    
    const mainService: Service = {
      name: appointment.service?.name || 'Serviço',
      duration: appointment.service?.duration_minutes || 0,
      price: appointment.service?.price || 0,
      type: 'main'
    };

    const services = [mainService, ...additionalServices];
    const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);

    console.log('🔍 parseAppointment - Final parsed data:', {
      id: appointment.id,
      services,
      totalPrice,
      totalDuration
    });

    return {
      id: appointment.id,
      client: appointment.client,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      services,
      totalPrice,
      totalDuration,
      clientNotes
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return {
    parseAppointment,
    parseAdditionalServices,
    getClientNotes,
    formatCurrency
  };
};