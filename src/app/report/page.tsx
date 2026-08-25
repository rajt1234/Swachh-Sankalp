'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { Complaint } from '@/lib/types'
import { Upload, MapPin, Loader2, CheckCircle, AlertCircle, Send, X, Camera, LogIn, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const WASTE_CATEGORIES = [
  { value: 'plastic', labelEn: 'Plastic', labelHi: 'प्लास्टिक', color: '#3B82F6', icon: '🥤' },
  { value: 'organic', labelEn: 'Organic', labelHi: 'जैविक', color: '#22C55E', icon: '🍂' },
  { value: 'paper', labelEn: 'Paper', labelHi: 'कागज', color: '#F59E0B', icon: '📄' },
  { value: 'metal', labelEn: 'Metal', labelHi: 'धातु', color: '#6B7280', icon: '🥫' },
  { value: 'glass', labelEn: 'Glass', labelHi: 'कांच', color: '#06B6D4', icon: '🍾' },
  { value: 'e-waste', labelEn: 'E-Waste', labelHi: 'ई-कचरा', color: '#8B5CF6', icon: '📱' },
  { value: 'mixed-waste', labelEn: 'Mixed Waste', labelHi: 'मिश्रित कचरा', color: '#EC4899', icon: '🗑️' },
]

const AI_RECOMMENDATIONS_EN: Record<string, string> = {
  plastic: 'Please segregate plastic waste and place it in the designated blue bin. Ensure it is clean and dry before disposal. Contact local recycling center for bulk disposal.',
  organic: 'Organic waste should be composted or placed in the green bin. Avoid mixing with non-organic materials. Consider starting a home compost pit.',
  paper: 'Paper waste can be recycled. Ensure it is dry and free from food contamination. Place in the blue recycling bin.',
  metal: 'Metal waste should be separated and taken to the nearest recycling center. Ferrous and non-ferrous metals should be sorted separately.',
  glass: 'Glass waste should be handled with care. Place in the designated glass recycling bin. Do not mix with other waste types.',
  'e-waste': 'E-waste contains hazardous materials. Do not dispose in regular bins. Take to authorized e-waste collection center. Data should be wiped from devices before disposal.',
  'mixed-waste': 'Mixed waste contains a combination of different waste types. Please try to segregate recyclables from non-recyclables where possible. Use separate bins for organic, recyclable, and hazardous waste. Contact local waste management for bulk mixed waste disposal.',
}

const AI_RECOMMENDATIONS_HI: Record<string, string> = {
  plastic: 'कृपया प्लास्टिक कचरे को अलग करें और निर्दिष्ट नीले बिन में रखें। निपटान से पहले इसे साफ और सुखा होने सुनिश्चित करें। बल्क निपटान के लिए स्थानीय रीसाइक्लिंग केंद्र से संपर्क करें।',
  organic: 'जैविक कचरे को कंपोस्ट या हरे बिन में रखा जाना चाहिए। गैर-जैविक सामग्री के साथ मिश्रण करने से बचें। घर का कंपोस्ट गड्ढा शुरू करने पर विचार करें।',
  paper: 'कागज कचरे को रीसाइक्ल किया जा सकता है। इसे सुखा होने और भोजन से दूषित होने से मुक्त होने सुनिश्चित करें। नीले रीसाइक्लिंग बिन में रखें।',
  metal: 'धातु कचरे को अलग करके निकटतम रीसाइक्लिंग केंद्र ले जाना चाहिए। लौह और अलौह धातु को अलग-अलग सॉर्ट करना चाहिए।',
  glass: 'कांच के कचरे को सावधानी से संभाला जाना चाहिए। निर्दिष्ट कांच रीसाइक्लिंग बिन में रखें। अन्य कचरे के प्रकार के साथ मिश्रित न करें।',
  'e-waste': 'ई-कचरा में खतरनाक सामग्री होती है। नियमित बिन में निपटान न करें। अधिकृत ई-कचरा संग्रह केंद्र पर लें। डिवाइस को निपटान से पहले डेटा मिटा दें।',
  'mixed-waste': 'मिश्रित कचरे में विभिन्न प्रकार के कचरे का संयोजन होता है। जहां संभव हो, रीसाइकल करने योग्य और गैर-रीसाइकल करने योग्य कचरे को अलग करने का प्रयास करें। जैविक, रीसाइकल करने योग्य और खतरनाक कचरे के लिए अलग-अलग बिन का उपयोग करें। बल्क मिश्रित कचरे के निपटान के लिए स्थानीय कचरे के प्रबंधन से संपर्क करें।',
}

export default function ReportPage() {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const MAX_DESCRIPTION_WORDS = 100

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [locationText, setLocationText] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [isLookingUpPin, setIsLookingUpPin] = useState(false)
  const [pinError, setPinError] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ area: string; city: string; state: string; pincode: string }>>([])

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<{
    category: string
    verified: boolean
    severity: 'high' | 'medium' | 'low'
    recommendation: string
  } | null>(null)

  const wordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length
  const isOverLimit = wordCount > MAX_DESCRIPTION_WORDS
  const isNearLimit = wordCount > MAX_DESCRIPTION_WORDS * 0.8 && !isOverLimit

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    if (words <= MAX_DESCRIPTION_WORDS) {
      setDescription(text)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const addressContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressContainerRef.current && !addressContainerRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(locale === 'hi' ? 'आपका ब्राउज़र भौगोलिक स्थान का समर्थन नहीं करता है' : 'Geolocation is not supported by your browser')
      return
    }
    setIsDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationText(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`)
        setIsDetectingLocation(false)
      },
      (error) => {
        setErrorMessage(locale === 'hi' ? 'स्थान का पता लगाने में विफल। कृपया मैन्युअल रूप से दर्ज करें।' : 'Failed to detect location. Please enter manually.')
        setIsDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  const lookupPinCodeSuggestions = async (pin: string) => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setSuggestions([])
      return
    }

    setIsLookingUpPin(true)
    setPinError('')

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await response.json()

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const suggestionsList = data[0].PostOffice.map((office: any) => ({
          area: office.Name || '',
          city: office.District || '',
          state: office.State || '',
          pincode: pin,
        }))
        setSuggestions(suggestionsList.slice(0, 5))
      } else {
        setSuggestions([])
        setPinError(locale === 'hi' ? 'पिन कोड नहीं मिला' : 'PIN code not found')
      }
    } catch (error) {
      console.error('PIN lookup error:', error)
      setSuggestions([])
      setPinError(locale === 'hi' ? 'पिन कोड लookup में त्रुटि' : 'Error looking up PIN code')
    } finally {
      setIsLookingUpPin(false)
    }
  }

  const selectSuggestion = (suggestion: { area: string; city: string; state: string; pincode: string }) => {
    const fullAddress = `${suggestion.area}, ${suggestion.city}, ${suggestion.state} - ${suggestion.pincode}`
    setAddress(fullAddress)
    setCity(suggestion.city)
    setState(suggestion.state)
    setPinCode(suggestion.pincode)
    setSuggestions([])
    setPinError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const runAIAnalysis = () => {
    if (!category && !description) {
      setErrorMessage(locale === 'hi' ? 'कृपया श्रेणी या विवरण चुनें' : 'Please select a category or enter a description')
      return
    }

    setIsAnalyzing(true)
    setAiResult(null)

    setTimeout(() => {
      const categories = WASTE_CATEGORIES.map(c => c.value)
      const detectedCategory = category || categories[Math.floor(Math.random() * categories.length)]
      const severities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
      const detectedSeverity = severities[Math.floor(Math.random() * severities.length)]
      const verified = Math.random() > 0.2

      setAiResult({
        category: detectedCategory,
        verified,
        severity: detectedSeverity,
        recommendation: locale === 'hi'
          ? AI_RECOMMENDATIONS_HI[detectedCategory] || AI_RECOMMENDATIONS_HI['plastic']
          : AI_RECOMMENDATIONS_EN[detectedCategory] || AI_RECOMMENDATIONS_EN['plastic'],
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleSubmit = async () => {
    if (isOverLimit) {
      setErrorMessage(locale === 'hi' ? 'विवरण 200 शब्दों से अधिक नहीं हो सकता' : 'Description cannot exceed 200 words')
      return
    }
    if (!category) {
      setErrorMessage(locale === 'hi' ? 'कृपया कचरे की श्रेणी चुनें' : 'Please select a waste category')
      return
    }
    if (!address.trim()) {
      setErrorMessage(locale === 'hi' ? 'कृपया पूरा पता दर्ज करें' : 'Please enter the full address')
      return
    }
    if (!imageFile) {
      setErrorMessage(locale === 'hi' ? 'कृपया समस्या की छवि अपलोड करें' : 'Please upload an image of the waste issue')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitStatus('error')
      setErrorMessage(locale === 'hi' ? 'कृपया पहले लॉगिन करें। रिपोर्ट जमा करने के लिए आपके लॉगिन होना आवश्यक है।' : 'Please login first to submit a report. Login is required to submit a report.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      let imageUrl: string | undefined
      let categoryUuid: string | undefined

      if (category) {
        const categoryName = WASTE_CATEGORIES.find(c => c.value === category)?.labelEn || category
        const { data: categoryData } = await supabase
          .from('waste_categories')
          .select('id')
          .eq('name', categoryName)
          .single()

        if (categoryData) {
          categoryUuid = categoryData.id
        }
      }

      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop()
          const fileName = `complaints/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('complaints')
            .upload(fileName, imageFile)

          if (uploadError) {
            console.warn('Image upload failed:', uploadError.message)
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('complaints')
              .getPublicUrl(fileName)

            imageUrl = publicUrl
          }
        } catch (uploadError) {
          console.warn('Image upload failed:', uploadError)
        }
      }

      const complaintData: Partial<Complaint> = {
        user_id: user.id,
        description: description.trim() || undefined,
        category_id: categoryUuid,
        image_url: imageUrl,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        location_text: locationText || undefined,
        address: address.trim() || undefined,
        pin_code: pinCode || undefined,
        city: city || undefined,
        state: state || undefined,
        status: 'pending',
        ai_category: aiResult?.category,
        ai_verified: aiResult?.verified,
        ai_severity: aiResult?.severity,
        ai_recommendation: aiResult?.recommendation,
      }

      const { error: insertError } = await supabase
        .from('complaints')
        .insert([complaintData])

      if (insertError) throw insertError

      const insertedComplaint = await supabase
        .from('complaints')
        .select('tracking_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubmittedComplaintId(insertedComplaint.data?.tracking_id || null)
      setSubmitStatus('success')

      setTimeout(() => {
        setDescription('')
        setCategory('')
        setImageFile(null)
        setImagePreview(null)
        setLocationText('')
        setLatitude(null)
        setLongitude(null)
        setAiResult(null)
        setSubmittedComplaintId(null)
        setSubmitStatus('idle')
      }, 8000)
    } catch (error: unknown) {
      console.error('Report submission error:', error)
      setSubmitStatus('error')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        setErrorMessage(String((error as { message: unknown }).message))
      } else {
        setErrorMessage(locale === 'hi' ? 'जमा करने में त्रुटि हुई' : 'An error occurred while submitting')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryInfo = (catValue: string) => WASTE_CATEGORIES.find(c => c.value === catValue)
  const selectedCategoryInfo = getCategoryInfo(category)
  const aiCategoryInfo = aiResult ? getCategoryInfo(aiResult.category) : null

  const severityLabel = (level: string) => {
    if (locale === 'hi') {
      const labels: Record<string, string> = { high: 'उच्च', medium: 'मध्यम', low: 'कम' }
      return labels[level] || level
    }
    const labels: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }
    return labels[level] || level
  }

  const severityColor = (level: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-amber-600 bg-amber-50 border-amber-200',
      low: 'text-green-600 bg-green-50 border-green-200',
    }
    return colors[level] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3">
            {locale === 'hi' ? 'कचरे की समस्या रिपोर्ट करें' : 'Report Waste Issue'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {locale === 'hi'
              ? 'अपने क्षेत्र में कचरे की समस्याओं की रिपोर्ट करें और हमारी टीम त्वरित कार्रवाई के लिए सक्रिय हो जाएगी।'
              : 'Report waste issues in your area and our team will take immediate action for cleanup.'}
          </p>
        </div>

        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">
                {locale === 'hi' ? 'रिपोर्ट जमा करने के लिए लॉगिन आवश्यक है' : 'Login required to submit a report'}
              </p>
              <p className="text-sm text-amber-600 mt-1">
                {locale === 'hi' ? 'कृपया पहले अपने खाते में लॉगिन करें।' : 'Please login to your account first.'}
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-dark transition-colors font-medium whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              {locale === 'hi' ? 'लॉगिन करें' : 'Login'}
            </Link>
          </div>
        )}

         {submitStatus === 'success' && (
           <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-lg">
             <div className="flex items-start gap-3">
               <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
               <div className="flex-1">
                 <p className="text-green-800 font-semibold text-base mb-1">
                   {locale === 'hi'
                     ? 'शिकायत सफलतापूर्वक जमा हो गई है! धन्यवाद।'
                     : 'Report submitted successfully! Thank you for your contribution.'}
                 </p>
                  {submittedComplaintId && (
                    <p className="text-sm text-green-700">
                      {locale === 'hi'
                        ? `आपकी रिपोर्ट का ट्रैकिंग आईडी: ${submittedComplaintId}`
                        : `Your report tracking ID: ${submittedComplaintId}`}
                    </p>
                  )}
                 <p className="text-sm text-green-600 mt-1">
                   {locale === 'hi'
                     ? 'आप ट्रैकिंग पेज से इसकी स्थिति देख सकते हैं।'
                     : 'You can track its status from the tracking page.'}
                 </p>
               </div>
             </div>
           </div>
         )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-saffron" />
                {locale === 'hi' ? 'समस्या विवरण' : 'Issue Details'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {locale === 'hi' ? 'विवरण' : 'Description'}
                    <span className={`ml-2 text-xs ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-400'}`}>
                      ({wordCount}/{MAX_DESCRIPTION_WORDS} {locale === 'hi' ? 'शब्द' : 'words'})
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    rows={4}
                    maxLength={5000}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-colors resize-none ${
                      isOverLimit ? 'border-red-300 bg-red-50' : isNearLimit ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
                    }`}
                    placeholder={locale === 'hi'
                      ? 'कचरे की समस्या का विवरण दें...'
                      : 'Describe the waste issue...'}
                  />
                  {isOverLimit && (
                    <p className="text-xs text-red-500 mt-1">
                      {locale === 'hi' ? 'विवरण 200 शब्दों से अधिक नहीं हो सकता' : 'Description cannot exceed 200 words'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {locale === 'hi' ? 'कचरे का श्रेणी' : 'Waste Category'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-colors bg-white"
                  >
                    <option value="">{locale === 'hi' ? '-- श्रेणी चुनें --' : '-- Select Category --'}</option>
                    {WASTE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {locale === 'hi' ? `${cat.icon} ${cat.labelHi}` : `${cat.icon} ${cat.labelEn}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {locale === 'hi' ? 'छवि अपलोड करें' : 'Upload Image'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                      <button
                        onClick={clearImage}
                        className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-saffron hover:bg-orange-50 transition-colors flex flex-col items-center gap-2 text-gray-500 hover:text-saffron"
                    >
                      <Camera className="w-8 h-8" />
                      <span className="text-sm font-medium">
                        {locale === 'hi' ? 'फोटो अपलोड करें या क्लिक करें' : 'Click to upload a photo'}
                      </span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {locale === 'hi' ? 'पूरा पता' : 'Full Address'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={addressContainerRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        const value = e.target.value
                        setAddress(value)

                        const pinMatch = value.match(/\d{6}/)
                        if (pinMatch) {
                          const detectedPin = pinMatch[0]
                          setPinCode(detectedPin)
                          lookupPinCodeSuggestions(detectedPin)
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-colors"
                      placeholder={locale === 'hi'
                        ? 'पता दर्ज करें, जैसे: "Connaught Place, New Delhi - 110001"'
                        : 'Enter address, e.g.: "Connaught Place, New Delhi - 110001"'}
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-saffron/5 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <p className="text-sm font-medium text-navy">{suggestion.area}</p>
                            <p className="text-xs text-gray-500">{suggestion.city}, {suggestion.state} - {suggestion.pincode}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {locale === 'hi' ? 'स्थान' : 'Location'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-colors"
                        placeholder={locale === 'hi'
                          ? 'स्थान दर्ज करें या खोजें...'
                          : 'Enter or search location...'}
                      />
                    </div>
                    <button
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className="px-4 py-3 bg-saffron text-navy rounded-lg font-medium hover:bg-saffron-dark transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                      {locale === 'hi' ? 'खोजें' : 'Detect'}
                    </button>
                  </div>
                  {latitude && longitude && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {locale === 'hi' ? 'स्थान सफलतापूर्वक पता चला' : 'Location detected successfully'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-navy flex items-center justify-center text-white text-xs font-bold">AI</div>
                {locale === 'hi' ? 'एआई विश्लेषण' : 'AI Analysis'}
              </h2>

              {!aiResult && !isAnalyzing && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {locale === 'hi'
                      ? 'फॉर्म भरने के बाद एआई विश्लेषण चलाएं'
                      : 'Run AI analysis after filling the form'}
                  </p>
                  <button
                    onClick={runAIAnalysis}
                    disabled={!category && !description.trim()}
                    className="px-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locale === 'hi' ? 'एआई विश्लेषण शुरू करें' : 'Run AI Analysis'}
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-saffron animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    {locale === 'hi' ? 'एआई विश्लेषण कर रहा है...' : 'Analyzing waste data...'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {locale === 'hi' ? 'कृपया प्रतीक्षा करें' : 'Please wait'}
                  </p>
                </div>
              )}

              {aiResult && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {locale === 'hi' ? 'पहचान की गई श्रेणी' : 'Detected Category'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{aiCategoryInfo?.icon}</span>
                        <span className="text-sm font-semibold text-navy">
                          {locale === 'hi' ? aiCategoryInfo?.labelHi : aiCategoryInfo?.labelEn}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {locale === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status'}
                      </p>
                      <div className="flex items-center gap-2">
                        {aiResult.verified ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              {locale === 'hi' ? 'वैध' : 'Valid'}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">
                              {locale === 'hi' ? 'अवैध' : 'Invalid'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {locale === 'hi' ? 'गंभीरता स्तर' : 'Severity Level'}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${severityColor(aiResult.severity)}`}>
                        {severityLabel(aiResult.severity)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                      {locale === 'hi' ? 'एआई सिफारिश' : 'AI Recommendation'}
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">{aiResult.recommendation}</p>
                  </div>

                  <button
                    onClick={runAIAnalysis}
                    className="text-sm text-saffron hover:text-saffron-dark font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {locale === 'hi' ? 'पुनः विश्लेषण करें' : 'Re-analyze'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-navy mb-4">
                {locale === 'hi' ? 'सबमिट करने से पहले' : 'Before Submitting'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {locale === 'hi' ? 'सटीक स्थान दर्ज करें' : 'Enter accurate location details'}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {locale === 'hi' ? 'स्पष्ट फोटो अपलोड करें' : 'Upload a clear photo of the waste'}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {locale === 'hi' ? 'एआई विश्लेषण चलाएं' : 'Run AI analysis for better categorization'}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {locale === 'hi' ? 'विवरण में सटीक जानकारी दें' : 'Provide accurate details in description'}
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-navy to-navy-light rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'hi' ? 'क्यों रिपोर्ट करें?' : 'Why Report?'}
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                {locale === 'hi'
                  ? 'आपकी रिपोर्ट हमारी टीम को कचरे की समस्या को तेजी से हल करने में मदद करती है। प्रत्येक रिपोर्ट स्वच्छ समुदाय की ओर एक कदम है।'
                  : 'Your report helps our team address waste issues quickly. Every report is a step towards a cleaner community.'}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isLoggedIn}
              className="w-full py-4 bg-saffron text-navy rounded-lg font-bold text-lg hover:bg-saffron-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === 'hi' ? 'जमा किया जा रहा है...' : 'Submitting...'}
                </>
              ) : !isLoggedIn ? (
                <>
                  <LogIn className="w-5 h-5" />
                  {locale === 'hi' ? 'लॉगिन करें और रिपोर्ट जमा करें' : 'Login to Submit Report'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {locale === 'hi' ? 'रिपोर्ट जमा करें' : 'Submit Report'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
