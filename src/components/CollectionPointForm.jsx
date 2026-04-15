
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const CollectionPointForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location_type: 'atelier'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        location_type: initialData.location_type || 'atelier'
      });
    } else {
      setFormData({
        name: '',
        address: '',
        location_type: 'atelier'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, location_type: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du point de collecte <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Boutique Paris Centre"
          required
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse complète <span className="text-red-500">*</span></Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Ex: 123 Rue de Rivoli, 75001 Paris"
          required
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location_type">Type de lieu</Label>
        <Select value={formData.location_type} onValueChange={handleSelectChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="atelier">Atelier</SelectItem>
            <SelectItem value="bureau">Entreprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name || !formData.address} className="bg-primary text-white hover:bg-primary/90">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default CollectionPointForm;
