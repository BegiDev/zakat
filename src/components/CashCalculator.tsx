import { useState, useEffect } from "react";

const CashCalculator = () => {
  const [category, setCategory] = useState<"cash" | "gold" | "silver" | "business" | "agriculture" | "">("");
  const [amount, setAmount] = useState<string>("");
  const [zakat, setZakat] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [helperText, setHelperText] = useState<string>("");
  const [usdRate, setUsdRate] = useState<number | null>(null);

  const fetchUsdRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();
      setUsdRate(data.rates.UZS); 
    } catch (error) {
      console.error("Dollar narxini olishda xatolik:", error);
      setError("Dollar narxini olishda xatolik yuz berdi.");
    }
  };

  useEffect(() => {
    fetchUsdRate();
  }, []); 

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as "cash" | "gold" | "silver" | "business" | "agriculture" | "";
    setCategory(selected);
    setAmount("");
    setZakat(null);
    setError("");

    switch (selected) {
      case "cash":
        setHelperText("Qo‘lingizdagi jami naqd pul miqdorini USDda kiriting.");
        break;
      case "gold":
        setHelperText("Sizda mavjud bo‘lgan oltin miqdorini grammda kiriting.");
        break;
      case "silver":
        setHelperText("Sizda mavjud bo‘lgan kumush miqdorini grammda kiriting.");
        break;
      case "business":
        setHelperText("Yil davomida qolgan sof biznes daromadingizni USDda kiriting.");
        break;
      case "agriculture":
        setHelperText("Yillik hosil miqdorini kgda kiriting.");
        break;
      default:
        setHelperText("");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError("");
  };

  const calculateZakat = () => {
    const value = parseFloat(amount);

    if (!amount || isNaN(value) || value <= 0) {
      setError("Iltimos, to‘g‘ri miqdor kiriting!");
      setZakat(null);
      return;
    }

    let nisab = 0;
    let zakatAmount = 0;

    switch (category) {
      case "cash":
      case "business":
        nisab = 5100;
        if (value < nisab) {
          setError(`Zakat farz emas. Miqdor nisobdan kam (${nisab} USD).`);
          setZakat(null);
          return;
        }
        zakatAmount = value * 0.025;
        break;
      case "gold":
        nisab = 85;
        if (value < nisab) {
          setError(`Zakat farz emas. Miqdor nisobdan kam (${nisab} gramm oltin).`);
          setZakat(null);
          return;
        }
        zakatAmount = (value * 60) * 0.025;
        break;
      case "silver":
        nisab = 595;
        if (value < nisab) {
          setError(`Zakat farz emas. Miqdor nisobdan kam (${nisab} gramm kumush).`);
          setZakat(null);
          return;
        }
        zakatAmount = (value * 0.8) * 0.025;
        break;
      case "agriculture":
        nisab = 653;
        if (value < nisab) {
          setError(`Zakat farz emas. Miqdor nisobdan kam (${nisab} kg hosil).`);
          setZakat(null);
          return;
        }
        zakatAmount = value * 0.05;
        break;
      default:
        setError("Iltimos, mol-mulk turini tanlang!");
        return;
    }

    setZakat(zakatAmount);
    setError("");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Zakat Hisoblagich</h1>

      <select
        value={category}
        onChange={handleCategoryChange}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Mol-mulk turini tanlang</option>
        <option value="cash">Naqd pul</option>
        <option value="gold">Oltin</option>
        <option value="silver">Kumush</option>
        <option value="business">Biznes daromadlari</option>
        <option value="agriculture">Qishloq xo‘jaligi mahsulotlari</option>
      </select>

      {helperText && (
        <p className="text-sm text-gray-600 mb-2">{helperText}</p>
      )}

      {category && (
        <div>
          <input
            type="number"
            placeholder={`Miqdorini kiriting`}
            value={amount}
            onChange={handleAmountChange}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={calculateZakat}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          >
            Hisoblash
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {zakat !== null && !error && (
        <p className="mt-4">
          Zakat miqdori: <span className="font-bold">{zakat.toFixed(2)} USD</span>
        </p>
      )}

      {usdRate !== null && (
        <p className="mt-4 text-gray-600">
          Hozirgi USD kursi: <span className="font-bold">{usdRate} UZS</span>
        </p>
      )}
    </div>
  );
};

export default CashCalculator;
