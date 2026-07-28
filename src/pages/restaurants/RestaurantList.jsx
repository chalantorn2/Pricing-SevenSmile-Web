import { useParams } from "react-router-dom";
import { UtensilsCrossed, MapPin, Construction } from "lucide-react";

const RestaurantList = () => {
  const { province } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">Restaurants</h1>
            {province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                <MapPin className="w-3.5 h-3.5" />
                {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage restaurant contract rates and information
          </p>
        </div>
      </div>

      {/* In development */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12">
        <div className="text-center space-y-5">
          <div className="mx-auto w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-9 h-9 text-brand-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {province ? `Restaurants — ${province}` : "Restaurant Management"}
            </h2>
            <p className="text-gray-500">This page is under development.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-warning-50 border border-warning-200 rounded-lg px-4 py-2">
            <Construction className="w-5 h-5 text-warning-700" />
            <span className="font-medium text-warning-800">In development</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;
