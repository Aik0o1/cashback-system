import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Wallet } from 'lucide-react';
import axios from 'axios';

const CashbackSelector = ({ total, onCashbackChange }) => {
  const [availableCashback, setAvailableCashback] = useState(0);
  const [selectedCashback, setSelectedCashback] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCashback();
  }, []);

  const fetchUserCashback = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5050/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setAvailableCashback(response.data.cashback || 0);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar cashback:', error);
      setLoading(false);
    }
  };

  const handleSliderChange = (values) => {
    const value = values[0];
    const maxCashback = Math.min(availableCashback, total);
    const newValue = Math.min(value, maxCashback);
    setSelectedCashback(newValue);
    onCashbackChange(newValue);
  };

  const handleMaxCashback = () => {
    const maxCashback = Math.min(availableCashback, total);
    setSelectedCashback(maxCashback);
    onCashbackChange(maxCashback);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-lime-600" />
          <h3 className="font-semibold text-zinc-900">Usar Cashback</h3>
        </div>
        <span className="text-sm text-zinc-600">
          Disponível: R$ {availableCashback.toFixed(2)}
        </span>
      </div>
      
      <div className="space-y-4">
        <Slider
          max={Math.min(availableCashback, total)}
          step={0.01}
          value={[selectedCashback]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600">
            Usando: R$ {selectedCashback.toFixed(2)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMaxCashback}
            className="text-lime-600 border-lime-600 hover:bg-lime-50"
          >
            Usar máximo
          </Button>
        </div>
        
        <div className="pt-2 border-t border-zinc-200">
          <div className="flex justify-between text-sm">
            <span>Valor total:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-lime-600">
            <span>Cashback aplicado:</span>
            <span>- R$ {selectedCashback.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-1">
            <span>Valor final:</span>
            <span>R$ {(total - selectedCashback).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CashbackSelector;