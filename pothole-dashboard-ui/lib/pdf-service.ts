/**
 * PDF GENERATION SERVICE
 * 
 * Professional PDF generation for contractor reports and government documentation.
 * Designed for smart city infrastructure reporting and compliance.
 * 
 * Features:
 * - Government/infrastructure report styling
 * - A4 printable format
 * - Future-ready for digital signatures and verification
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ContractorPDFData {
  id: string;
  name: string;
  rating: number;
  establishedYear: number;
  specialization: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  certifications: string[];
  stats: {
    totalRoadsBuilt: number;
    averageRoadHealth: number;
    totalPotholes: number;
    rating: number;
    totalLength: number;
    roadsNeedingRepair: number;
  };
  roads?: Array<{
    name: string;
    cityName: string;
    healthScore: number;
    potholeCount: number;
    constructionYear: number;
    length: number;
  }>;
}

class PDFService {
  private static instance: PDFService;
  
  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Generate contractor performance report PDF
   * Professional format suitable for government and infrastructure use
   */
  generateContractorReport(contractorData: ContractorPDFData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Header - Government Style
    doc.setFillColor(41, 128, 185); // Professional blue
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART CITY INFRASTRUCTURE REPORT', margin, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Road Health & Contractor Performance Analysis', margin, 20);

    // Reset colors and position
    doc.setTextColor(0, 0, 0);
    yPosition = 35;

    // Report metadata
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 40, yPosition);
    doc.text(`Report ID: RPT-${contractorData.id.toUpperCase()}`, pageWidth - margin - 40, yPosition + 5);
    yPosition += 20;

    // Contractor Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(contractorData.name, margin, yPosition);
    yPosition += 8;

    // Rating stars
    doc.setFontSize(12);
    doc.setTextColor(255, 193, 7); // Gold color for stars
    const stars = '★'.repeat(Math.floor(contractorData.rating)) + '☆'.repeat(5 - Math.floor(contractorData.rating));
    doc.text(`${stars} (${contractorData.rating}/5.0)`, margin, yPosition);
    yPosition += 15;

    // Summary Statistics Box
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'S');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFORMANCE SUMMARY', margin + 5, yPosition + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const summaryData = [
      [`Total Roads Built: ${contractorData.stats.totalRoadsBuilt}`, `Average Road Health: ${contractorData.stats.averageRoadHealth}%`],
      [`Total Length: ${contractorData.stats.totalLength} km`, `Roads Needing Repair: ${contractorData.stats.roadsNeedingRepair}`],
      [`Total Potholes: ${contractorData.stats.totalPotholes}`, `Established: ${contractorData.establishedYear}`]
    ];

    let summaryY = yPosition + 15;
    summaryData.forEach(row => {
      doc.text(row[0], margin + 5, summaryY);
      doc.text(row[1], margin + 90, summaryY);
      summaryY += 5;
    });

    yPosition += 45;

    // Contact Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT INFORMATION', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Address: ${contractorData.contactInfo.address}`, margin, yPosition);
    doc.text(`Phone: ${contractorData.contactInfo.phone}`, margin, yPosition + 5);
    doc.text(`Email: ${contractorData.contactInfo.email}`, margin, yPosition + 10);
    yPosition += 20;

    // Specializations
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SPECIALIZATIONS', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    contractorData.specialization.forEach((spec, index) => {
      doc.text(`• ${spec}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;

    // Certifications
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    contractorData.certifications.forEach((cert, index) => {
      doc.text(`✓ ${cert}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Roads Table
    if (contractorData.roads && contractorData.roads.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ROAD CONSTRUCTION PORTFOLIO', margin, yPosition);
      yPosition += 10;

      // Prepare table data
      const tableData = contractorData.roads.map(road => [
        road.name,
        road.cityName,
        road.constructionYear.toString(),
        `${road.length} km`,
        `${road.healthScore}%`,
        road.potholeCount.toString()
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Road Name', 'City', 'Built', 'Length', 'Health', 'Potholes']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 50 }, // Road Name
          1: { cellWidth: 25 }, // City
          2: { cellWidth: 20 }, // Built
          3: { cellWidth: 20 }, // Length
          4: { cellWidth: 20 }, // Health
          5: { cellWidth: 25 }  // Potholes
        },
        margin: { left: margin, right: margin }
      });
    }

    // Footer
    const finalY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This report is generated by Smart City Infrastructure Management System', margin, finalY);
    doc.text('For official use only • Confidential', pageWidth - margin - 60, finalY);

    // Future: Digital signature placeholder
    doc.setFontSize(7);
    doc.text('Digital Signature: [To be implemented with government PKI]', margin, finalY + 5);

    // Save the PDF
    const fileName = `contractor-report-${contractorData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Generate pothole evidence report (future feature)
   */
  generatePotholeReport(potholeData: any): void {
    // Future implementation for pothole evidence reports
    console.log('Pothole report generation - Coming soon');
  }

  /**
   * Generate city-wide infrastructure summary (future feature)
   */
  generateCitySummaryReport(cityData: any): void {
    // Future implementation for city-wide reports
    console.log('City summary report generation - Coming soon');
  }
}

// Export singleton instance
export const pdfService = PDFService.getInstance();

export default pdfService;