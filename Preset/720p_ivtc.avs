SetMemoryMax(1024)

global PluginDir = "__ac__Avisynth\"
global PresetDir = "__ac__Preset\"
global LogoDir = "__ac__Logo\"

Import(PresetDir + "function.avsi")

__opt__

video = (nv == true) ? DGDecodeNV_("__vid__") : DGDecode_("__vid__")
audio = (faw == true) ? AACFaw_("__aud__") : BassAudio_("__aud__")
AudioDub(video, audio)
(faw == true) ? last : DelayAudio(last, __del__)
__trim__
(av == true) ? Its_(last, "__def__", "__tmc__") : IVTC_(last)
Exist(LogoDir + service + ".lgd") ? Delogo_(last, service) : last
BilinearResize(last, 1280, 720, 0, 0.6)
return last