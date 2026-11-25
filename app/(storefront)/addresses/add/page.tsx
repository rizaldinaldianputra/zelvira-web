'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  ArrowLeft,
  Save,
  Loader2,
  Check,
  Building2,
  Home,
  Briefcase,
  Phone,
  User,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { AddressService } from '@/services/address.service';
import { ShippingService, LocationItem } from '@/services/shipping.service';
import { Address } from '@/types/address';
import { SearchableSelect, SearchableOption } from '@/components/ui/searchable-select';

export default function AddAddressPage() {
  const router = useRouter();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // 3-Tier Location states (Provinsi, Kota/Kabupaten, Kecamatan)
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);

  const [selectedProv, setSelectedProv] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDist, setSelectedDist] = useState('');

  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.push('/login?redirect=/addresses/add');
      return;
    }

    const user = authService.getUser();
    if (user?.fullName && !recipientName) {
      setRecipientName(user.fullName);
    }
    if (user?.phoneNumber && !phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const redir = searchParams.get('redirect');
    const idParam = searchParams.get('id');

    if (redir) setRedirectUrl(redir);
    if (idParam) setEditingId(idParam);

    // Load provinces
    ShippingService.getProvinces()
      .then(setProvinces)
      .catch((err) => console.error('Failed to load provinces', err));

    // If editing existing address, load its data
    if (idParam) {
      AddressService.getAll()
        .then(async (all) => {
          const found = (all || []).find((a) => String(a.id) === String(idParam));
          if (found) {
            setLabel(found.label || 'Rumah');
            setRecipientName(found.recipientName || '');
            setPhoneNumber(found.phoneNumber || '');
            setAddressLine(found.addressLine || '');
            setPostalCode(found.postalCode || '');
            setIsDefault(Boolean(found.isDefault));

            if (found.provinceId) {
              setSelectedProv(String(found.provinceId));
              const cityList = await ShippingService.getCities(String(found.provinceId));
              setCities(cityList);

              if (found.cityId) {
                setSelectedCity(String(found.cityId));
                const distList = await ShippingService.getDistricts(String(found.cityId));
                setDistricts(distList);

                if (found.districtId || found.subdistrictId) {
                  setSelectedDist(String(found.districtId || found.subdistrictId));
                }
              }
            }
          }
        })
        .catch((e) => console.error('Failed to load address for edit', e))
        .finally(() => setIsLoadingInitial(false));
    } else {
      setIsLoadingInitial(false);
    }
  }, [router]);

  // Load cities when province changes
  const handleProvinceChange = async (provId: string) => {
    setSelectedProv(provId);
    setSelectedCity('');
    setSelectedDist('');
    setCities([]);
    setDistricts([]);

    if (provId) {
      setIsLoadingCities(true);
      try {
        const list = await ShippingService.getCities(provId);
        setCities(list);
      } catch (e) {
        console.error('Failed to load cities', e);
      } finally {
        setIsLoadingCities(false);
      }
    }
  };

  // Load districts when city changes
  const handleCityChange = async (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDist('');
    setDistricts([]);

    if (cityId) {
      setIsLoadingDistricts(true);
      try {
        const list = await ShippingService.getDistricts(cityId);
        setDistricts(list);

        // Autofill postal code if available from city
        const cityObj = cities.find((c) => String(c.id || c.city_id) === String(cityId));
        if (cityObj?.postal_code && !postalCode) {
          setPostalCode(cityObj.postal_code);
        }
      } catch (e) {
        console.error('Failed to load districts', e);
      } finally {
        setIsLoadingDistricts(false);
      }
    }
  };

  // Convert to SearchableOption format
  const provinceOptions: SearchableOption[] = provinces.map((p) => ({
    value: String(p.id || p.province_id),
    label: p.name || p.province || '',
  }));

  const cityOptions: SearchableOption[] = cities.map((c) => ({
    value: String(c.id || c.city_id),
    label: `${c.type || ''} ${c.name || c.city_name || c.city}`.trim(),
  }));

  const districtOptions: SearchableOption[] = districts.map((d) => ({
    value: String(d.id || d.district_id),
    label: d.name || d.district_name || '',
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      toast.error('Nama penerima wajib diisi');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Nomor telepon penerima wajib diisi');
      return;
    }
    if (!selectedProv) {
      toast.error('Silakan pilih Provinsi');
      return;
    }
    if (!selectedCity) {
      toast.error('Silakan pilih Kota / Kabupaten');
      return;
    }
    if (!selectedDist) {
      toast.error('Silakan pilih Kecamatan');
      return;
    }
    if (!addressLine.trim()) {
      toast.error('Alamat lengkap jalan/nomor rumah wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const provObj = provinces.find((p) => String(p.id || p.province_id) === String(selectedProv));
      const provName = provObj?.name || provObj?.province || '';

      const cityObj = cities.find((c) => String(c.id || c.city_id) === String(selectedCity));
      const cityName = cityObj ? `${cityObj.type || ''} ${cityObj.name || cityObj.city_name || cityObj.city}`.trim() : '';

      const distObj = districts.find((d) => String(d.id || d.district_id) === String(selectedDist));
      const distName = distObj?.name || distObj?.district_name || '';

      const payload: Partial<Address> = {
        label: label || 'Rumah',
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressLine: addressLine.trim(),
        postalCode: postalCode.trim(),
        isDefault,
        provinceId: String(selectedProv),
        provinceName: provName,
        cityId: String(selectedCity),
        cityName: cityName,
        districtId: String(selectedDist),
        districtName: distName,
        // Set subdistrictId & subdistrictName to district for complete RajaOngkir compatibility
        subdistrictId: String(selectedDist),
        subdistrictName: distName,
      };

      if (editingId) {
        await AddressService.update(editingId, payload);
        toast.success('Alamat berhasil diperbarui!');
      } else {
        await AddressService.create(payload);
        toast.success('Alamat baru berhasil ditambahkan!');
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/addresses');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan alamat ke server');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <p className="text-xs font-bold text-neutral-400">Memuat data alamat...</p>
      </div>
    );
  }

  const backLink = redirectUrl || '/addresses';
  const backLabel = redirectUrl === '/checkout' ? 'Kembali ke Checkout' : 'Kembali ke Daftar Alamat';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Top Navigation */}
      <div className="mb-6">
        <Link
          href={backLink}
          className="group inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition-all hover:border-pink-300 hover:text-pink-600 active:scale-95 shadow-sm"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          {backLabel}
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-100 shadow-xl shadow-black/5 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {editingId ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru'}
            </h1>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              Alamat akan disimpan ke akun Anda dan terhubung langsung ke tarif ongkir ekspedisi resmi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Label Selection Quick Chips */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block mb-2">
              Label Alamat
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { name: 'Rumah', icon: Home },
                { name: 'Kantor', icon: Briefcase },
                { name: 'Apartemen', icon: Building2 },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setLabel(item.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                    label === item.name
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <item.icon size={14} />
                  {item.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Atau ketik label kustom (misal: Rumah Nenek, Gudang)"
              className="w-full p-3.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-none transition-all text-xs font-bold"
            />
          </div>

          {/* Recipient & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block mb-1.5">
                Nama Penerima <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama Lengkap Penerima"
                  className="w-full pl-10 pr-4 py-3.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-none transition-all text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block mb-1.5">
                Nomor Telepon / WhatsApp <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full pl-10 pr-4 py-3.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-none transition-all text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* 3-Tier Searchable Dropdowns (Provinsi, Kota, Kecamatan) */}
          <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-2">
              <MapPin size={15} className="text-pink-500" /> Wilayah Pengiriman (Pencarian Cepat)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Provinsi */}
              <SearchableSelect
                label="Provinsi"
                required
                placeholder="Pilih Provinsi..."
                searchPlaceholder="Ketik nama provinsi..."
                options={provinceOptions}
                value={selectedProv}
                onChange={handleProvinceChange}
              />

              {/* 2. Kota / Kabupaten */}
              <SearchableSelect
                label="Kota / Kabupaten"
                required
                placeholder={selectedProv ? 'Pilih Kota/Kab...' : 'Pilih Provinsi dulu'}
                searchPlaceholder="Ketik nama kota / kab..."
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedProv}
                isLoading={isLoadingCities}
              />

              {/* 3. Kecamatan */}
              <SearchableSelect
                label="Kecamatan"
                required
                placeholder={selectedCity ? 'Pilih Kecamatan...' : 'Pilih Kota/Kab dulu'}
                searchPlaceholder="Ketik nama kecamatan..."
                options={districtOptions}
                value={selectedDist}
                onChange={setSelectedDist}
                disabled={!selectedCity}
                isLoading={isLoadingDistricts}
              />
            </div>
          </div>

          {/* Detailed Street Address & Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block mb-1.5">
                Alamat Lengkap (Jalan, RT/RW, No. Rumah, Patokan) <span className="text-pink-500">*</span>
              </label>
              <textarea
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Contoh: Jl. Melati No. 45, RT 02 / RW 05 (Pagar Hitam Depan Masjid)"
                rows={3}
                className="w-full p-3.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-none transition-all text-xs font-bold leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600 block mb-1.5">
                Kode Pos
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Contoh: 11530"
                className="w-full p-3.5 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-none transition-all text-xs font-bold"
              />
            </div>
          </div>

          {/* Is Default Checkbox */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40 cursor-pointer hover:bg-neutral-50 transition-colors">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-neutral-800 block">Jadikan Alamat Utama</span>
              <span className="text-[11px] text-neutral-400">Alamat ini akan otomatis dipilih pertama kali saat checkout.</span>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100">
            <Link
              href={backLink}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold text-xs uppercase tracking-wider text-center transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Alamat...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>{editingId ? 'Simpan Perubahan Alamat' : 'Simpan Alamat Pengiriman'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

