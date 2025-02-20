export const playNotification = async () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 10.0;

        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator1.type = 'triangle';
        oscillator2.type = 'sine';

        oscillator1.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator1.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.1);

        oscillator2.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator2.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.1);

        // volume
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(10, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);

        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.3);

        return new Promise(resolve => {
            setTimeout(() => {
                gainNode.disconnect();
                oscillator1.disconnect();
                oscillator2.disconnect();
                filter.disconnect();
                resolve();
            }, 400);
        });
    } catch (error) {
        console.error("Erro ao tocar notificação:", error);
        return Promise.resolve();
    }
};