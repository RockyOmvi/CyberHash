package scanner

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type AWSScanner struct {
	region    string
	accessKey string
	secretKey string
}

type BucketInfo struct {
	Name         string
	CreationDate time.Time
	Region       string
}

func NewAWSScanner(region, accessKey, secretKey string) *AWSScanner {
	return &AWSScanner{
		region:    region,
		accessKey: accessKey,
		secretKey: secretKey,
	}
}

func (a *AWSScanner) ListBuckets(ctx context.Context) ([]BucketInfo, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(a.region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load aws config: %w", err)
	}

	client := s3.NewFromConfig(cfg)
	output, err := client.ListBuckets(ctx, &s3.ListBucketsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}

	var buckets []BucketInfo
	for _, b := range output.Buckets {
		buckets = append(buckets, BucketInfo{
			Name:         aws.ToString(b.Name),
			CreationDate: aws.ToTime(b.CreationDate),
			Region:       a.region, // ListBuckets doesn't return region, assuming current
		})
	}
	return buckets, nil
}

func (a *AWSScanner) Start(ctx context.Context, target string) (string, error) {
	scanID := fmt.Sprintf("aws-%d", time.Now().Unix())
	fmt.Printf("Starting Real AWS Scan for region %s with ID %s\n", a.region, scanID)
	go a.runScan(scanID)
	return scanID, nil
}

// Simple in-memory store for demo purposes (replace with DB in production)
var awsScanResults = make(map[string]*ScanResult)

func (a *AWSScanner) runScan(scanID string) {
	buckets, err := a.ListBuckets(context.Background())
	if err != nil {
		awsScanResults[scanID] = &ScanResult{
			ScanID: scanID,
			Status: "failed",
			Vulnerabilities: []Vuln{{
				Title:       "AWS Scan Failed",
				Description: err.Error(),
				Severity:    "Error",
			}},
		}
		return
	}

	var vulns []Vuln
	for _, bucket := range buckets {
		vulns = append(vulns, Vuln{
			Title:       "S3 Bucket Found",
			Description: fmt.Sprintf("Found bucket: %s created at %v", bucket.Name, bucket.CreationDate),
			Severity:    "Info",
			Category:    "AWS S3",
			Solution:    "Ensure bucket is private if it contains sensitive data.",
		})
	}

	awsScanResults[scanID] = &ScanResult{
		ScanID:          scanID,
		Status:          "completed",
		Vulnerabilities: vulns,
	}
}

func (a *AWSScanner) GetStatus(ctx context.Context, scanID string) (string, int, error) {
	if res, ok := awsScanResults[scanID]; ok {
		if res.Status == "completed" || res.Status == "failed" {
			return res.Status, 100, nil
		}
		return "running", 50, nil
	}
	return "unknown", 0, nil
}

func (a *AWSScanner) GetResults(ctx context.Context, scanID string) (*ScanResult, error) {
	if res, ok := awsScanResults[scanID]; ok {
		return res, nil
	}
	return nil, fmt.Errorf("scan not found")
}

func (a *AWSScanner) GetHistory(ctx context.Context) ([]*ScanResult, error) {
	var history []*ScanResult
	for _, res := range awsScanResults {
		history = append(history, res)
	}
	return history, nil
}
