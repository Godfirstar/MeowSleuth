import os, wave, struct, math
root=r'C:\Users\FIRST\Desktop\projects\assets\sfx'
os.makedirs(root, exist_ok=True)

def tone(path, freq=880.0, dur=0.08, sr=48000, vol=0.35, attack=0.005, release=0.03):
    n=int(dur*sr)
    with wave.open(path,'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        for i in range(n):
            t=i/sr
            env=1.0
            if t<attack: env=t/attack
            if t>dur-release: env=max(0.0,(dur-t)/release)
            v=math.sin(2*math.pi*freq*t)*vol*env
            w.writeframesraw(struct.pack('<h', int(max(-1,min(1,v))*32767)))

def sweep(path, f0=180, f1=1200, dur=0.22, sr=48000, vol=0.3):
    n=int(dur*sr)
    with wave.open(path,'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        phase=0.0
        for i in range(n):
            t=i/sr
            f=f0+(f1-f0)*(t/dur)
            phase += 2*math.pi*f/sr
            env = 1.0 if t<dur*0.8 else max(0.0,(dur-t)/(dur*0.2))
            v=math.sin(phase)*vol*env
            w.writeframesraw(struct.pack('<h', int(max(-1,min(1,v))*32767)))

def thump(path, freq=70, dur=0.18, sr=48000, vol=0.55):
    n=int(dur*sr)
    with wave.open(path,'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        for i in range(n):
            t=i/sr
            env=math.exp(-20*t)
            v=math.sin(2*math.pi*freq*t)*vol*env
            w.writeframesraw(struct.pack('<h', int(max(-1,min(1,v))*32767)))

tone(os.path.join(root,'ui_click.wav'),freq=1100,dur=0.07)
tone(os.path.join(root,'radar_beep.wav'),freq=920,dur=0.1)
sweep(os.path.join(root,'whoosh_short.wav'))
thump(os.path.join(root,'alert_hit.wav'))
print('ok')
