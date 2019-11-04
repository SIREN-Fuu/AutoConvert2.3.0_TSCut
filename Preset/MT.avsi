# 2018/4/10
 
# -- Core --
SetFilterMTMode("DEFAULT_MT_MODE", MT_SERIALIZED) 
 
# -- Source --
SetFilterMTMode("MPEG2source",         MT_NICE_FILTER)
SetFilterMTMode("DGsourceIM",          MT_SERIALIZED)
SetFilterMTMode("LWLibavVideoSource",  MT_SERIALIZED)
SetFilterMTMode("LWLibavAudioSource",  MT_SERIALIZED)
SetFilterMtMode("AudioDub",            MT_SERIALIZED)

# -- Dither --
SetFilterMTMode("DitherPost",          MT_NICE_FILTER)
SetFilterMTMode("SmoothGrad",          MT_NICE_FILTER)
SetFilterMTMode("Dither_box_filter16", MT_NICE_FILTER)
SetFilterMTMode("Dither_bilateral16",  MT_NICE_FILTER)
SetFilterMTMode("Dither_limit_dif16",  MT_NICE_FILTER)
SetFilterMTMode("Dither_resize16",     MT_NICE_FILTER)
SetFilterMTMode("Dither_out",          MT_NICE_FILTER)
SetFilterMTMode("Dither_removegrain16",MT_NICE_FILTER)
SetFilterMTMode("Dither_repair16",     MT_NICE_FILTER)
SetFilterMTMode("Dither_median16",     MT_NICE_FILTER)
SetFilterMTMode("Dither_add16",        MT_NICE_FILTER)
SetFilterMTMode("Dither_sub16",        MT_NICE_FILTER)
SetFilterMTMode("Dither_max_dif16",    MT_NICE_FILTER)
SetFilterMTMode("Dither_merge16",      MT_NICE_FILTER)
SetFilterMTMode("f3kdb",               MT_MULTI_INSTANCE) 
 
# -- SmoothAdjust --
SetFilterMTMode("SmoothLevels",        MT_NICE_FILTER)
SetFilterMTMode("SmoothTweak",         MT_NICE_FILTER)
SetFilterMTMode("SmoothCurve",         MT_NICE_FILTER)
SetFilterMTMode("SmoothCustom",        MT_NICE_FILTER)
 
# -- DeInterlace & IT --
SetFilterMTMode("TDeint",              MT_MULTI_INSTANCE)
SetFilterMTMode("Vinverse",            MT_MULTI_INSTANCE)
 
# -- DeCross & DeDot --
SetFilterMTMode("Tcomb",               MT_SERIALIZED)
SetFilterMTMode("DeDot",               MT_SERIALIZED)
SetFilterMTMode("DeCross",             MT_SERIALIZED)
 
# -- DeNoise --
SetFilterMTMode("dfttest",             MT_SERIALIZED)
SetFilterMTMode("TNLMeans",            MT_MULTI_INSTANCE)
SetFilterMTMode("KNLMeansCL",          MT_MULTI_INSTANCE)
SetFilterMTMode("MosquitoNR",          MT_SERIALIZED) 
SetFilterMTMode("Deblock",             MT_NICE_FILTER)
 
# -- Logo(?) --
SetFilterMTMode("EraseLOGO",           MT_MULTI_INSTANCE)
SetFilterMTMode("AddLOGO",             MT_MULTI_INSTANCE)
SetFilterMTMode("EraseLogoMod",        MT_MULTI_INSTANCE)
 
# -- avstp --
if (FunctionExists("avstp_set_threads")) {
    avstp_set_threads(0, 1) 
}
