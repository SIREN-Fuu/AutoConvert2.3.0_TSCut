Function DGDecode_(string vid) {
  LoadPlugin(PluginDir + "DGDecode.dll")
  clp = MPEG2Source(vid)
  return clp
}

Function DGDecodeNV_(string vid) {
  LoadPlugin(PluginDir + "DGDecodeNV.dll")
  clp = DGSource(vid)
  return clp
}

Function Deint_(clip vid) {
  LoadPlugin(PluginDir + "TDeint.dll")
  clp = TDeint(vid, type=3, full=false, tryWeave=true)
  return clp
}

Function IVTC_(clip vid) {
  LoadPlugin(PluginDir + "TDeint.dll")
  LoadPlugin(PluginDir + "TIVTC.dll")
  clp = TDeint(vid, type=3, full=false, tryWeave=true)
  clp = CropBottom(clp, 250).TDecimate(mode=1, clip2=clp)
  return clp
}

Function Its_(clip vid, string def, string tmc) {
  LoadPlugin(PluginDir + "Its.dll")
  LoadPlugin(PluginDir + "TDeint.dll")
  LoadPlugin(PluginDir + "TIVTC.dll")
  clp = Its(vid, def=def, output=tmc, fps=-1, debug=false)
  return clp
}

Function Bob_(clip vid) {
  LoadPlugin(PluginDir + "TDeint.dll")
  clp = TDeint(vid, mode=1, type=3, full=false, tryWeave=true)
  return clp
}

Function BassAudio_(string aud) {
  LoadPlugin(PluginDir + "BassAudio.dll")
  clp = bassAudioSource(aud)
  return clp
}

Function AACFaw_(string aud) {
  LoadPlugin(PluginDir + "aacfaw.aui")
  clp = AACFaw(aud)
  return clp
}

Function Delogo_(clip vid, string svc) {
  Exist(PluginDir + "delogo.dll") ? LoadPlugin(PluginDir + "delogo.dll") : vid
  clp = Exist(PluginDir + "delogo.dll") ?  EraseLOGO(vid, logofile=LogoDir + svc + ".lgd") : vid
  return clp
}

Function WarpSharp_(clip vid) {
  LoadPlugin(PluginDir + "warpsharp.dll")
  LoadPlugin(PluginDir + "MT.dll")
  clp = MT(vid, "WarpSharp(depth=100, bump=100)", threads=8, overlap=4)
  return clp
}

# Auto_VFR_Fast ver 0.1.0.1 written by putin
function Auto_VFR_Fast(clip c,string file,int "cut",int "number"
                                  \,int "cthresh",int "mi", bool "chroma", int "blockx", int "blocky"){
  
    LoadPlugin(PluginDir + "TIVTC.dll")
    h=c.height()
    total=c.framecount()
    c1=c.DoubleWeave().SelectOdd().SelectEvery(3,1)
    total2=c1.framecount()
    
    Iscut=Defined(cut)?true:false
    Isnumber=Defined(number)?true:false
    
    global start=Isnumber?int(total2 *float(float(number-1)/float(cut))):0
    end=Isnumber?int((total2 *float(float(number)/float(cut))))-1:0   
    c1=Iscut?c1.Trim(start,end):c1
             
    HDsize=720
    cthresh_default=(h>=HDsize)?9:7
    mi_default=(h>=HDsize)?80:50
    blocks_default=(h>=HDsize)?16:32    
    
    cth=default(cthresh,cthresh_default)
    mi=default(mi,mi_default)
    chrm=default(chroma,false)
    bx=default(blockx,blocks_default)
    by=default(blocky,blocks_default)    
                                      
    
    str_total=(start==0)?"total_f-" + string(total):""
    WriteFileStart(c1, file,"str_total",append=false)   
    (start==0)?WriteFileStart(c1, file,""""fast_f-"""","string(total2)",append=true):nop    
    
    return WriteFile(c1,file,"string(current_frame+start)",""""-""""
        \,"""string((IsCombedTIVTC(cthresh="""+string(cth)+""",MI="""+string(mi)+""",chroma="""
        \+string(chrm)+""",blockx="""+string(bx)+""",blocky="""+string(by)+"""))?"1":"0")"""
        \,flush=false)
}