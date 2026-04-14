import { useState, useCallback } from "react";

const usePalindoWilayah = () => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState(null);

  const fetchProvinces = useCallback(async () => {
    setLoadingProvinces(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_WILAYAH_URL}/api/v1/wilayah/provinsi`,
        {
          headers: {
            "x-palindo-api-key": process.env.NEXT_PUBLIC_API_KEY_WILAYAH,
          },
        },
      );
      if (!res.ok) throw new Error("Gagal mengambil data provinsi");
      const data = await res.json();
      setProvinces(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  const fetchCities = useCallback(async (provinceId) => {
    if (!provinceId) return;
    setLoadingCities(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_WILAYAH_URL}/api/v1/wilayah/kota?province_id=${provinceId}`,
        {
          headers: {
            "x-palindo-api-key": process.env.NEXT_PUBLIC_API_KEY_WILAYAH,
          },
        },
      );
      if (!res.ok) throw new Error("Gagal mengambil data kota");
      const data = await res.json();
      setCities(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  return {
    provinces,
    cities,
    loadingProvinces,
    loadingCities,
    error,
    fetchProvinces,
    fetchCities,
    setCities, // Berguna jika ingin mengosongkan kota saat provinsi direset
  };
};

export default usePalindoWilayah;
