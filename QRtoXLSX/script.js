const app = {
            codes: {},
            currentView: 'scanner',
            html5QrCode: null,
            isScanning: false,
            lastModified: null,

            init() {
                this.loadCodes();
            },

            async startScanner() {
                try {
                    const reader = document.getElementById('reader');
                    document.getElementById('permissionMsg').style.display = 'none';
                    reader.style.display = 'block';

                    this.html5QrCode = new Html5Qrcode("reader");

                    const config = {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    };

                    await this.html5QrCode.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText) => {
                            this.onCodeScanned(decodedText);
                        },
                        (errorMessage) => {
                            // Silenciar errores de escaneo continuo
                        }
                    );

                    this.isScanning = true;
                } catch (err) {
                    console.error('Error al iniciar escáner:', err);
                    alert('No se pudo acceder a la cámara. Por favor, permite el acceso e intenta nuevamente.');
                    document.getElementById('permissionMsg').style.display = 'block';
                    document.getElementById('reader').style.display = 'none';
                }
            },

            async onCodeScanned(code) {
                if (!this.isScanning) return;
                
                this.isScanning = false;

                // Detener el escáner
                if (this.html5QrCode) {
                    try {
                        await this.html5QrCode.stop();
                    } catch (err) {
                        console.error('Error al detener escáner:', err);
                    }
                }

                // Registrar el código
                if (this.codes[code]) {
                    this.codes[code]++;
                } else {
                    this.codes[code] = 1;
                }

                this.lastModified = code;
                this.saveCodes();
                this.showSuccess(code);

                // Ir a la lista después de 0.5s
                setTimeout(() => {
                    this.goToList();
                }, 500);
            },

            showSuccess(code) {
                const msg = document.getElementById('successMsg');
                msg.textContent = code;
                msg.style.display = 'block';
                setTimeout(() => {
                    msg.style.display = 'none';
                }, 500);
            },

            goToList() {
                const scannerView = document.getElementById('scannerView');
                const listView = document.getElementById('listView');
                const fabIcon = document.getElementById('fabIcon');

                this.currentView = 'list';
                scannerView.classList.remove('active');
                listView.classList.add('active');
                fabIcon.textContent = '📷';
                
                document.getElementById('reader').style.display = 'none';
                
                this.renderList();
            },

            async toggleView() {
                const scannerView = document.getElementById('scannerView');
                const listView = document.getElementById('listView');
                const fabIcon = document.getElementById('fabIcon');

                if (this.currentView === 'scanner') {
                    // Ir a lista
                    if (this.html5QrCode && this.isScanning) {
                        try {
                            await this.html5QrCode.stop();
                        } catch (err) {
                            console.error('Error al detener:', err);
                        }
                        this.isScanning = false;
                    }
                    
                    this.currentView = 'list';
                    scannerView.classList.remove('active');
                    listView.classList.add('active');
                    fabIcon.textContent = '📷';
                    
                    document.getElementById('reader').style.display = 'none';
                    
                    this.renderList();
                } else {
                    // Ir a escáner
                    this.currentView = 'scanner';
                    listView.classList.remove('active');
                    scannerView.classList.add('active');
                    fabIcon.textContent = '📋';
                    
                    document.getElementById('permissionMsg').style.display = 'none';
                    document.getElementById('reader').style.display = 'block';
                    
                    // Reiniciar escáner
                    await this.startScanner();
                }
            },

            renderList() {
                const content = document.getElementById('listContent');
                const entries = Object.entries(this.codes);

                // if (entries.length === 0) {
                //     content.innerHTML = `
                //         <div class="empty-state">
                //             <h2>Sin escaneos</h2>
                //             <p>Presiona el botón para escanear tu primer código QR</p>
                //         </div>
                //     `;
                //     return;
                // }

                // Ordenar por SKU
                entries.sort((a, b) => a[0].localeCompare(b[0]));

                const rows = entries.map(([sku, count]) => {
                    const isLastModified = this.lastModified === sku ? 'class="last-modified"' : '';
                    return `
                        <tr ${isLastModified}>
                            <td>${sku}</td>
                            <td>
                                <div class="actions">
                                    <button class="btn-action btn-delete" onclick="app.decrementCode('${sku}')">−</button>
                                    <span style="min-width: 30px; text-align: center;">${count}</span>
                                    <button class="btn-action" onclick="app.incrementCode('${sku}')">+</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                content.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Código SKU</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                    <div class="total-count">
                        Total de códigos únicos: ${entries.length}
                        <br>
                        Total de ítems: ${entries.reduce((sum, [, count]) => sum + count, 0)}
                    </div>
                `;
            },

            incrementCode(sku) {
                this.codes[sku]++;
                this.lastModified = sku;
                this.saveCodes();
                this.renderList();
            },

            decrementCode(sku) {
                if (this.codes[sku] > 1) {
                    this.codes[sku]--;
                    this.lastModified = sku;
                } else {
                    if (confirm(`¿Eliminar el código ${sku}?`)) {
                        delete this.codes[sku];
                        this.lastModified = null;
                    } else {
                        return;
                    }
                }
                this.saveCodes();
                this.renderList();
            },

            downloadExcel() {
                const entries = Object.entries(this.codes);
                
                if (entries.length === 0) {
                    alert('No hay datos para descargar');
                    return;
                }

                // Ordenar por SKU
                entries.sort((a, b) => a[0].localeCompare(b[0]));

                const data = entries.map(([sku, count]) => ({
                    'Código SKU': sku,
                    'Cantidad': count
                }));

                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Códigos QR');
                
                const fecha = new Date().toISOString().split('T')[0];
                XLSX.writeFile(wb, `QR_Scan_${fecha}.xlsx`);
            },

            saveCodes() {
                const data = JSON.stringify(this.codes);
                localStorage.setItem('qr_codes', data);
            },

            loadCodes() {
                const data = localStorage.getItem('qr_codes');
                if (data) {
                    this.codes = JSON.parse(data);
                }
            }
        };

        app.init();