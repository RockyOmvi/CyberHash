package redhat

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestIsSuspiciousBehavior(t *testing.T) {
	// Mock DB not needed for pure logic test
	engine := &EDREngine{db: &gorm.DB{}}

	tests := []struct {
		name           string
		child          string
		parent         string
		wantSuspicious bool
	}{
		{
			name:           "Benign: Explorer spawning Chrome",
			child:          "chrome.exe",
			parent:         "explorer.exe",
			wantSuspicious: false,
		},
		{
			name:           "Malicious: Word spawning PowerShell",
			child:          "powershell.exe",
			parent:         "winword.exe",
			wantSuspicious: true,
		},
		{
			name:           "Malicious: Excel spawning CMD",
			child:          "cmd.exe",
			parent:         "excel.exe",
			wantSuspicious: true,
		},
		{
			name:           "Malicious: Java spawning Bash",
			child:          "bash",
			parent:         "java.exe",
			wantSuspicious: true,
		},
		{
			name:           "Malicious: IIS spawning CMD",
			child:          "cmd.exe",
			parent:         "w3wp.exe",
			wantSuspicious: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, _ := engine.IsSuspiciousBehavior(tt.child, tt.parent)
			assert.Equal(t, tt.wantSuspicious, got)
		})
	}
}
