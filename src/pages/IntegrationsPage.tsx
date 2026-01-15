import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { integrationService } from '../services/integration.service';
import { IntegrationsShimmer } from '../components/shimmer/IntegrationsShimmer';
import { SlackIntegrationSetup } from '../components/integrations/SlackIntegrationSetup';
import { DiscordIntegrationSetup } from '../components/integrations/DiscordIntegrationSetup';
import { LinearIntegrationSetup } from '../components/integrations/LinearIntegrationSetup';
import { JiraIntegrationSetup } from '../components/integrations/JiraIntegrationSetup';
import { WebhookIntegrationSetup } from '../components/integrations/WebhookIntegrationSetup';
import { IntegrationLogs } from '../components/integrations/IntegrationLogs';
import { LinearIntegrationViewModal } from '../components/integrations/LinearIntegrationViewModal';
import { JiraIntegrationViewModal } from '../components/integrations/JiraIntegrationViewModal';
import {
    PlusIcon,
    XMarkIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import GitHubConnector from '../components/chat/GitHubConnector';
import GoogleConnector from '../components/chat/GoogleConnector';
import VercelConnector from '../components/integrations/VercelConnector';
import { AWSConnector } from '../components/integrations/AWSConnector';
import { AWSServicePanel } from '../components/integrations/AWSServicePanel';
import { VercelServicePanel } from '../components/chat/VercelServicePanel';
import { MongoDBIntegrationPanel } from '../components/chat/MongoDBIntegrationPanel';
import FeatureSelector from '../components/chat/FeatureSelector';
import githubService, { GitHubRepository, GitHubConnection } from '../services/github.service';
import { useTheme } from '../contexts/ThemeContext';
import googleService, { GoogleConnection } from '../services/google.service';
import vercelService, { VercelConnection } from '../services/vercel.service';
import { awsService, AWSConnection } from '../services/aws.service';
import { mongodbService, MongoDBConnection } from '../services/mongodb.service';
import linearIcon from '../assets/linear-app-icon-seeklogo.svg';
import jiraIcon from '../assets/jira.png';

type SetupModal = 'slack' | 'discord' | 'linear' | 'jira' | 'webhook' | 'github' | 'google' | 'vercel' | 'aws' | 'mongodb' | null;
type ViewModal = { type: 'linear' | 'jira'; integrationId: string } | null;

export const IntegrationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [setupModal, setSetupModal] = useState<SetupModal>(null);
    const [viewModal, setViewModal] = useState<ViewModal>(null);
    const [showLogs, setShowLogs] = useState(false);
    const [showVercelPanel, setShowVercelPanel] = useState(false);
    const [showAWSPanel, setShowAWSPanel] = useState(false);
    const [showMongoDBPanel, setShowMongoDBPanel] = useState(false);
    const [selectedAWSConnection, setSelectedAWSConnection] = useState<AWSConnection | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepository; connectionId: string } | null>(null);
    const [showFeatureSelector, setShowFeatureSelector] = useState(false);
    const [githubConnections, setGithubConnections] = useState<GitHubConnection[]>([]);
    const [githubIntegrations, setGithubIntegrations] = useState<Array<{ _id: string; repositoryName: string; status: string }>>([]);
    const [googleConnections, setGoogleConnections] = useState<GoogleConnection[]>([]);
    const [vercelConnections, setVercelConnections] = useState<VercelConnection[]>([]);
    const [awsConnections, setAwsConnections] = useState<AWSConnection[]>([]);
    const [mongodbConnections, setMongodbConnections] = useState<MongoDBConnection[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { data: integrationsData, isLoading, error, refetch } = useQuery(
        ['integrations'],
        () => integrationService.getIntegrations(),
        {
            retry: 1,
            onError: (err) => {
                console.error('Failed to fetch integrations:', err);
            }
        }
    );

    const integrations = integrationsData?.data || [];

    // Function to load integration data
    const loadIntegrationData = async () => {
        try {
            const [githubConn, gitIntegrations, googleConn, vercelConn, awsResult, mongodbConn] = await Promise.all([
                githubService.listConnections(),
                githubService.listIntegrations(),
                googleService.listConnections().catch(() => []),
                vercelService.listConnections().catch(() => []),
                awsService.listConnections().catch(() => ({ connections: [] })),
                mongodbService.listConnections().catch(() => [])
            ]);
            setGithubConnections(githubConn);
            setGithubIntegrations(gitIntegrations);
            setGoogleConnections(googleConn);
            setVercelConnections(vercelConn);
            setAwsConnections(awsResult.connections || []);
            setMongodbConnections(mongodbConn);
        } catch (error) {
            console.error('Failed to load integration data:', error);
        }
    };

    // Load GitHub and Google connections and integrations on mount
    useEffect(() => {
        loadIntegrationData();
    }, []);

    // Handle OAuth callback redirects
    useEffect(() => {
        const googleConnected = searchParams.get('googleConnected');
        const vercelConnected = searchParams.get('vercelConnected');
        const message = searchParams.get('message');

        if (googleConnected === 'true') {
            // Reload Google connections
            loadIntegrationData();

            // Show success message
            if (message) {
                setSuccessMessage(decodeURIComponent(message));
            } else {
                setSuccessMessage('Google account connected successfully!');
            }

            // Clear query parameters
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('googleConnected');
            newSearchParams.delete('message');
            setSearchParams(newSearchParams, { replace: true });

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        }

        if (vercelConnected === 'true') {
            // Reload Vercel connections
            loadIntegrationData();

            // Show success message
            if (message) {
                setSuccessMessage(decodeURIComponent(message));
            } else {
                setSuccessMessage('Vercel account connected successfully!');
            }

            // Clear query parameters
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('vercelConnected');
            newSearchParams.delete('message');
            setSearchParams(newSearchParams, { replace: true });

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        }
    }, [searchParams, setSearchParams]);

    const handleSetupComplete = () => {
        setSetupModal(null);
        refetch();
    };

    const handleSelectRepository = (repo: GitHubRepository, connectionId: string) => {
        setSelectedRepo({ repo, connectionId });
        setSetupModal(null);
        setShowFeatureSelector(true);
    };

    const handleStartIntegration = async (
        features: { name: string; enabled: boolean }[],
        integrationType: 'npm' | 'cli' | 'python' | 'http-headers'
    ) => {
        if (!selectedRepo) return;

        try {
            await githubService.startIntegration({
                connectionId: selectedRepo.connectionId,
                repositoryId: selectedRepo.repo.id,
                repositoryName: selectedRepo.repo.name,
                repositoryFullName: selectedRepo.repo.fullName,
                integrationType,
                selectedFeatures: features
            });

            setShowFeatureSelector(false);
            setSelectedRepo(null);
            refetch();
            // Reload GitHub data
            const [connections, gitIntegrations] = await Promise.all([
                githubService.listConnections(),
                githubService.listIntegrations()
            ]);
            setGithubConnections(connections);
            setGithubIntegrations(gitIntegrations);
        } catch (error) {
            console.error('Failed to start integration:', error);
        }
    };

    const handleDisconnectGitHub = async (connectionId: string) => {
        if (window.confirm('Are you sure you want to disconnect GitHub? This will remove all your GitHub connections and integrations.')) {
            try {
                await githubService.disconnectConnection(connectionId);
                const [connections, gitIntegrations] = await Promise.all([
                    githubService.listConnections(),
                    githubService.listIntegrations()
                ]);
                setGithubConnections(connections);
                setGithubIntegrations(gitIntegrations);
            } catch (error) {
                console.error('Failed to disconnect GitHub:', error);
            }
        }
    };

    // Check if an integration type is connected
    const isIntegrationConnected = (type: string): boolean => {
        if (type === 'github') {
            return githubConnections.some(conn => conn.isActive);
        }
        if (type === 'google') {
            return googleConnections.some(conn => conn.isActive);
        }
        if (type === 'vercel') {
            return vercelConnections.some(conn => conn.isActive);
        }
        if (type === 'aws') {
            return awsConnections.some(conn => conn.status === 'active');
        }
        if (type === 'mongodb') {
            return mongodbConnections.some(conn => conn.isActive);
        }

        // For other integrations, check if there's an active integration
        return integrations.some(integ => {
            if (type === 'slack') {
                return integ.type === 'slack_webhook' || integ.type === 'slack_oauth';
            }
            if (type === 'discord') {
                return integ.type === 'discord_webhook' || integ.type === 'discord_oauth';
            }
            if (type === 'linear') {
                return integ.type === 'linear_oauth';
            }
            if (type === 'jira') {
                return integ.type === 'jira_oauth';
            }
            if (type === 'webhook') {
                return integ.type === 'custom_webhook';
            }
            return false;
        });
    };

    // Handle Vercel disconnect
    const handleDisconnectVercel = async (connectionId: string) => {
        if (window.confirm('Are you sure you want to disconnect Vercel? This will remove your Vercel connection.')) {
            try {
                await vercelService.disconnectConnection(connectionId);
                loadIntegrationData();
            } catch (error) {
                console.error('Failed to disconnect Vercel:', error);
            }
        }
    };


    const availableIntegrations = [
        {
            type: 'aws' as const,
            name: 'AWS',
            description: 'Connect your AWS account for cost optimization with natural language commands',
            icon: (
                <img
                    src={theme === 'dark'
                        ? '/assets/aws-logo.svg'
                        : '/assets/aws-logo.svg'
                    }
                    alt="Powered by AWS"
                    className="w-6 h-6 object-contain"
                />
            ),
            color: '#FF9900',
        },
        {
            type: 'github' as const,
            name: 'GitHub',
            description: 'Auto-integrate CostKatana into your repositories via pull requests',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            ),
            color: '#06ec9e',
        },
        {
            type: 'google' as const,
            name: 'Google Workspace',
            description: 'Export cost data to Google Sheets and Docs, sync budgets with Drive',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            ),
            color: '#4285F4',
        },
        {
            type: 'vercel' as const,
            name: 'Vercel',
            description: 'Deploy and manage your Vercel projects, domains, and environment variables',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24">
                    <path d="M12 2L2 19.5h20L12 2z" fill="#fff" />
                </svg>
            ),
            color: '#000000',
        },
        {
            type: 'mongodb' as const,
            name: 'MongoDB',
            description: 'Query your MongoDB databases with natural language using @mongodb commands',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fillRule="evenodd" clipRule="evenodd" fill="#439934" d="M88.038 42.812c1.605 4.643 2.761 9.383 3.141 14.296.472 6.095.256 12.147-1.029 18.142-.035.165-.109.32-.164.48-.403.001-.814-.049-1.208.012-3.329.523-6.655 1.065-9.981 1.604-3.438.557-6.881 1.092-10.313 1.687-1.216.21-2.721-.041-3.212 1.641-.014.046-.154.054-.235.08l.166-10.051-.169-24.252 1.602-.275c2.62-.429 5.24-.864 7.862-1.281 3.129-.497 6.261-.98 9.392-1.465 1.381-.215 2.764-.412 4.148-.618z"/><path fillRule="evenodd" clipRule="evenodd" fill="#45A538" d="M61.729 110.054c-1.69-1.453-3.439-2.842-5.059-4.37-8.717-8.222-15.093-17.899-18.233-29.566-.865-3.211-1.442-6.474-1.627-9.792-.13-2.322-.318-4.665-.154-6.975.437-6.144 1.325-12.229 3.127-18.147l.099-.138c.175.233.427.439.516.702 1.759 5.18 3.505 10.364 5.242 15.551 5.458 16.3 10.909 32.604 16.376 48.9.107.318.384.579.583.866l-.87 2.969z"/><path fillRule="evenodd" clipRule="evenodd" fill="#46A037" d="M88.038 42.812c-1.384.206-2.768.403-4.149.616-3.131.485-6.263.968-9.392 1.465-2.622.417-5.242.852-7.862 1.281l-1.602.275-.012-1.045c-.053-.859-.144-1.717-.154-2.576-.069-5.478-.112-10.956-.18-16.434-.042-3.429-.105-6.857-.175-10.285-.043-2.13-.089-4.261-.185-6.388-.052-1.143-.236-2.28-.311-3.423-.042-.657.016-1.319.029-1.979.817 1.583 1.616 3.178 2.456 4.749 1.327 2.484 3.441 4.314 5.344 6.311 7.523 7.892 12.864 17.068 16.193 27.433z"/><path fillRule="evenodd" clipRule="evenodd" fill="#409433" d="M65.036 80.753c.081-.026.222-.034.235-.08.491-1.682 1.996-1.431 3.212-1.641 3.432-.594 6.875-1.13 10.313-1.687 3.326-.539 6.652-1.081 9.981-1.604.394-.062.805-.011 1.208-.012-.622 2.22-1.112 4.488-1.901 6.647-.896 2.449-1.98 4.839-3.131 7.182a49.142 49.142 0 01-6.353 9.763c-1.919 2.308-4.058 4.441-6.202 6.548-1.185 1.165-2.582 2.114-3.882 3.161l-.337-.23-1.214-1.038-1.256-2.753a41.402 41.402 0 01-1.394-9.838l.023-.561.171-2.426c.057-.828.133-1.655.168-2.485.129-2.982.241-5.964.359-8.946z"/><path fillRule="evenodd" clipRule="evenodd" fill="#4FAA41" d="M65.036 80.753c-.118 2.982-.23 5.964-.357 8.947-.035.83-.111 1.657-.168 2.485l-.765.289c-1.699-5.002-3.399-9.951-5.062-14.913-2.75-8.209-5.467-16.431-8.213-24.642a4498.887 4498.887 0 00-6.7-19.867c-.105-.31-.407-.552-.617-.826l4.896-9.002c.168.292.39.565.496.879a6167.476 6167.476 0 016.768 20.118c2.916 8.73 5.814 17.467 8.728 26.198.116.349.308.671.491 1.062l.67-.78-.167 10.052z"/><path fillRule="evenodd" clipRule="evenodd" fill="#4AA73C" d="M43.155 32.227c.21.274.511.516.617.826a4498.887 4498.887 0 016.7 19.867c2.746 8.211 5.463 16.433 8.213 24.642 1.662 4.961 3.362 9.911 5.062 14.913l.765-.289-.171 2.426-.155.559c-.266 2.656-.49 5.318-.814 7.968-.163 1.328-.509 2.632-.772 3.947-.198-.287-.476-.548-.583-.866-5.467-16.297-10.918-32.6-16.376-48.9a3888.972 3888.972 0 00-5.242-15.551c-.089-.263-.34-.469-.516-.702l3.272-8.84z"/><path fillRule="evenodd" clipRule="evenodd" fill="#57AE47" d="M65.202 70.702l-.67.78c-.183-.391-.375-.714-.491-1.062-2.913-8.731-5.812-17.468-8.728-26.198a6167.476 6167.476 0 00-6.768-20.118c-.105-.314-.327-.588-.496-.879l6.055-7.965c.191.255.463.482.562.769 1.681 4.921 3.347 9.848 5.003 14.778 1.547 4.604 3.071 9.215 4.636 13.813.105.308.47.526.714.786l.012 1.045c.058 8.082.115 16.167.171 24.251z"/><path fillRule="evenodd" clipRule="evenodd" fill="#60B24F" d="M65.021 45.404c-.244-.26-.609-.478-.714-.786-1.565-4.598-3.089-9.209-4.636-13.813-1.656-4.93-3.322-9.856-5.003-14.778-.099-.287-.371-.514-.562-.769 1.969-1.928 3.877-3.925 5.925-5.764 1.821-1.634 3.285-3.386 3.352-5.968.003-.107.059-.214.145-.514l.519 1.306c-.013.661-.072 1.322-.029 1.979.075 1.143.259 2.28.311 3.423.096 2.127.142 4.258.185 6.388.069 3.428.132 6.856.175 10.285.067 5.478.111 10.956.18 16.434.008.861.098 1.718.152 2.577z"/><path fillRule="evenodd" clipRule="evenodd" fill="#A9AA88" d="M62.598 107.085c.263-1.315.609-2.62.772-3.947.325-2.649.548-5.312.814-7.968l.066-.01.066.011a41.402 41.402 0 001.394 9.838c-.176.232-.425.439-.518.701-.727 2.05-1.412 4.116-2.143 6.166-.1.28-.378.498-.574.744l-.747-2.566.87-2.969z"/><path fillRule="evenodd" clipRule="evenodd" fill="#B6B598" d="M62.476 112.621c.196-.246.475-.464.574-.744.731-2.05 1.417-4.115 2.143-6.166.093-.262.341-.469.518-.701l1.255 2.754c-.248.352-.59.669-.728 1.061l-2.404 7.059c-.099.283-.437.483-.663.722l-.695-3.985z"/><path fillRule="evenodd" clipRule="evenodd" fill="#C2C1A7" d="M63.171 116.605c.227-.238.564-.439.663-.722l2.404-7.059c.137-.391.48-.709.728-1.061l1.215 1.037c-.587.58-.913 1.25-.717 2.097l-.369 1.208c-.168.207-.411.387-.494.624-.839 2.403-1.64 4.819-2.485 7.222-.107.305-.404.544-.614.812-.109-1.387-.22-2.771-.331-4.158z"/><path fillRule="evenodd" clipRule="evenodd" fill="#CECDB7" d="M63.503 120.763c.209-.269.506-.508.614-.812.845-2.402 1.646-4.818 2.485-7.222.083-.236.325-.417.494-.624l-.509 5.545c-.136.157-.333.294-.398.477-.575 1.614-1.117 3.24-1.694 4.854-.119.333-.347.627-.525.938-.158-.207-.441-.407-.454-.623-.051-.841-.016-1.688-.013-2.533z"/><path fillRule="evenodd" clipRule="evenodd" fill="#DBDAC7" d="M63.969 123.919c.178-.312.406-.606.525-.938.578-1.613 1.119-3.239 1.694-4.854.065-.183.263-.319.398-.477l.012 3.64-1.218 3.124-1.411-.495z"/><path fillRule="evenodd" clipRule="evenodd" fill="#EBE9DC" d="M65.38 124.415l1.218-3.124.251 3.696-1.469-.572z"/><path fillRule="evenodd" clipRule="evenodd" fill="#CECDB7" d="M67.464 110.898c-.196-.847.129-1.518.717-2.097l.337.23-1.054 1.867z"/><path fillRule="evenodd" clipRule="evenodd" fill="#4FAA41" d="M64.316 95.172l-.066-.011-.066.01.155-.559-.023.56z"/></svg>
            ),
            color: '#439934',
        },
        {
            type: 'slack' as const,
            name: 'Slack',
            description: 'Send alerts to Slack channels with rich formatting',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
            ),
            color: '#4A154B',
        },
        {
            type: 'discord' as const,
            name: 'Discord',
            description: 'Send alerts to Discord channels with rich embeds',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            ),
            color: '#5865F2',
        },
        {
            type: 'linear' as const,
            name: 'Linear',
            description: 'Send alerts as comments or create issues in Linear',
            icon: (
                <img src={linearIcon} alt="Linear" className="integration-icon" style={{ width: '24px', height: '24px' }} />
            ),
            color: '#5E6AD2',
        },
        {
            type: 'jira' as const,
            name: 'JIRA',
            description: 'Send alerts as comments or create issues in JIRA',
            icon: (
                <img src={jiraIcon} alt="JIRA" className="integration-icon" style={{ width: '24px', height: '24px' }} />
            ),
            color: '#0052CC',
        },
        {
            type: 'webhook' as const,
            name: 'Custom Webhook',
            description: 'Send alerts to any custom webhook endpoint',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            color: '#6B7280',
        },
    ];

    return (
        <div className="px-3 py-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="p-4 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 lg:p-8 lg:mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex-1">
                            <h1 className="mb-3 text-2xl font-bold font-display gradient-text-primary sm:text-3xl lg:text-4xl lg:mb-4">Integrations</h1>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300 sm:text-base">
                                Connect Cost Katana with GitHub, MongoDB, AWS, Google Workspace, Vercel, Slack, Discord, Linear, JIRA, and custom webhooks
                            </p>
                        </div>
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className="px-4 py-2.5 font-semibold text-white rounded-lg transition-all duration-300 bg-gradient-secondary hover:shadow-lg glow-secondary text-sm sm:text-base sm:px-6 sm:py-3 w-full sm:w-auto"
                        >
                            {showLogs ? 'Hide Logs' : 'View Logs'}
                        </button>
                    </div>
                </div>

                {/* Success Message Banner */}
                {successMessage && (
                    <div className="mb-6 p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 sm:p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircleSolidIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <p className="flex-1 text-sm font-medium text-green-700 dark:text-green-300 sm:text-base">
                                {successMessage}
                            </p>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <IntegrationsShimmer />
                ) : (
                    <>

                        {showLogs ? (
                            <IntegrationLogs onClose={() => setShowLogs(false)} />
                        ) : (
                            <>
                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 mb-4 rounded-lg border backdrop-blur-sm glass border-red-200/30 bg-red-50/80 dark:bg-red-900/20 sm:p-4 sm:mb-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="w-4 h-4 text-red-400 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-xs text-red-700 dark:text-red-200 sm:text-sm">
                                                    Failed to load integrations. You can still add new integrations below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Unified Integrations List */}
                                <div>
                                    <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-center sm:mb-6">
                                        <h2 className="text-xl font-bold font-display gradient-text-primary sm:text-2xl">Integrations</h2>
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-300 dark:border-success-700 font-display sm:px-3 sm:text-sm">
                                            {integrations.length + (githubConnections.filter(c => c.isActive).length) + (mongodbConnections.filter(c => c.isActive).length)} Connected
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                                        {availableIntegrations.map((integration) => {
                                            const isConnected = isIntegrationConnected(integration.type);

                                            // Get GitHub connection details if connected
                                            const githubConnection = isConnected && integration.type === 'github'
                                                ? githubConnections.find(c => c.isActive)
                                                : null;

                                            // Get Google connection details if connected
                                            const googleConnection = isConnected && integration.type === 'google'
                                                ? googleConnections.find(c => c.isActive)
                                                : null;

                                            // Get Vercel connection details if connected
                                            const vercelConnection = isConnected && integration.type === 'vercel'
                                                ? vercelConnections.find(c => c.isActive)
                                                : null;

                                            // Get AWS connection details if connected
                                            const awsConnection = isConnected && integration.type === 'aws'
                                                ? awsConnections.find(c => c.status === 'active')
                                                : null;

                                            // Get MongoDB connection details if connected
                                            const mongodbConnection = isConnected && integration.type === 'mongodb'
                                                ? mongodbConnections.find(c => c.isActive)
                                                : null;

                                            // Get regular integrations for this type
                                            const regularIntegrations = integrations.filter(integ => {
                                                if (integration.type === 'slack') return integ.type === 'slack_webhook' || integ.type === 'slack_oauth';
                                                if (integration.type === 'discord') return integ.type === 'discord_webhook' || integ.type === 'discord_oauth';
                                                if (integration.type === 'linear') return integ.type === 'linear_oauth';
                                                if (integration.type === 'jira') return integ.type === 'jira_oauth';
                                                if (integration.type === 'webhook') return integ.type === 'custom_webhook';
                                                return false;
                                            });

                                            return (
                                                <div
                                                    key={integration.type}
                                                    className={`glass rounded-xl border ${isConnected
                                                        ? 'border-success-200/50 dark:border-success-500/30'
                                                        : 'border-primary-200/30 dark:border-primary-500/20'
                                                        } shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 hover:shadow-xl transition-all duration-300 flex flex-col h-full sm:p-5 lg:p-6`}
                                                >
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                                        <div className="flex flex-1 gap-2 items-center min-w-0 sm:gap-3">
                                                            <div
                                                                className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl shadow-lg sm:w-12 sm:h-12"
                                                                style={{ backgroundColor: `${integration.color}20` }}
                                                            >
                                                                <div style={{ color: integration.color, width: '20px', height: '20px' }} className="sm:w-6 sm:h-6">
                                                                    {integration.icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="mb-1 text-base font-bold truncate font-display text-secondary-900 dark:text-white sm:text-lg">
                                                                    {integration.name}
                                                                </h3>
                                                                {githubConnection && (
                                                                    <p className="text-xs truncate text-secondary-600 dark:text-secondary-300 sm:text-sm">
                                                                        @{githubConnection.githubUsername}
                                                                    </p>
                                                                )}
                                                                {googleConnection && (
                                                                    <p className="text-xs truncate text-secondary-600 dark:text-secondary-300 sm:text-sm">
                                                                        {googleConnection.googleEmail}
                                                                    </p>
                                                                )}
                                                                {vercelConnection && (
                                                                    <p className="text-xs truncate text-secondary-600 dark:text-secondary-300 sm:text-sm">
                                                                        {vercelConnection.teamSlug || vercelConnection.vercelUsername || 'Vercel Account'}
                                                                    </p>
                                                                )}
                                                                {awsConnection && (
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-xs truncate text-secondary-600 dark:text-secondary-300 sm:text-sm font-medium">
                                                                            {awsConnection.connectionName}
                                                                        </p>
                                                                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                                                            AWS Account ID: {awsConnection.roleArn.match(/arn:aws:iam::(\d+):role/)?.[1] || 'Unknown'}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {mongodbConnection && (
                                                                    <p className="text-xs truncate text-secondary-600 dark:text-secondary-300 sm:text-sm">
                                                                        {mongodbConnection.alias}
                                                                    </p>
                                                                )}
                                                                {regularIntegrations.length > 0 && !githubConnection && !awsConnection && !mongodbConnection && (
                                                                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                                                        {regularIntegrations.length} {regularIntegrations.length === 1 ? 'integration' : 'integrations'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isConnected && (
                                                                <span className="px-2 py-0.5 bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-300 dark:border-success-700 rounded-full text-xs font-display font-semibold flex items-center gap-1 flex-shrink-0 sm:px-2.5 sm:py-1">
                                                                    <CheckCircleSolidIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                                    <span className="hidden sm:inline">Connected</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="flex-grow mb-3 text-xs text-secondary-600 dark:text-secondary-300 font-body sm:text-sm sm:mb-4">
                                                        {integration.description}
                                                    </p>

                                                    {/* GitHub Specific Info */}
                                                    {isConnected && githubConnection && (
                                                        <div className="p-2.5 mb-3 rounded-lg border glass border-primary-200/20 dark:border-primary-500/10 sm:p-3 sm:mb-4">
                                                            <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
                                                                {githubConnection.repositories?.length || 0} {githubConnection.repositories?.length === 1 ? 'Repository' : 'Repositories'}
                                                                {githubIntegrations.length > 0 && (
                                                                    <> • {githubIntegrations.length} {githubIntegrations.length === 1 ? 'Integration' : 'Integrations'}</>
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* AWS Specific Info */}
                                                    {isConnected && awsConnection && (
                                                        <div className="p-2.5 mb-3 rounded-lg border glass border-primary-200/20 dark:border-primary-500/10 sm:p-3 sm:mb-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
                                                                        {awsConnection.environment.charAt(0).toUpperCase() + awsConnection.environment.slice(1)} Environment
                                                                    </p>
                                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${awsConnection.status === 'active'
                                                                        ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300 border border-success-300 dark:border-success-700'
                                                                        : 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-300 dark:border-danger-700'
                                                                        }`}>
                                                                        {awsConnection.status === 'active' ? '● Active' : '● Error'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-secondary-600 dark:text-secondary-300">
                                                                    {awsConnection.permissionMode === 'read-only' ? (
                                                                        <span className="flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                            </svg>
                                                                            Read-Only Access
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Read-Write Access
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700 rounded-full">
                                                                        {awsConnection.allowedServices?.length || 0} Services
                                                                    </span>
                                                                    <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700 rounded-full">
                                                                        {awsConnection.allowedRegions?.length || 0} Regions
                                                                    </span>
                                                                    {awsConnection.totalExecutions > 0 && (
                                                                        <span className="px-2 py-0.5 text-xs bg-secondary-100 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 border border-secondary-300 dark:border-secondary-700 rounded-full">
                                                                            {awsConnection.totalExecutions} Executions
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {awsConnection.health?.lastError && (
                                                                    <p className="text-xs text-danger-600 dark:text-danger-400 mt-1 flex items-center gap-1">
                                                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                        <span>{awsConnection.health.lastError}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* MongoDB Specific Info */}
                                                    {isConnected && mongodbConnection && (
                                                        <div className="p-2.5 mb-3 rounded-lg border glass border-primary-200/20 dark:border-primary-500/10 sm:p-3 sm:mb-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
                                                                        Database Connection
                                                                    </p>
                                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300 border border-success-300 dark:border-success-700">
                                                                        ● Active
                                                                    </span>
                                                                </div>
                                                                {mongodbConnection.metadata?.database && (
                                                                    <p className="text-xs text-secondary-600 dark:text-secondary-300">
                                                                        Database: <span className="font-medium">{mongodbConnection.metadata.database}</span>
                                                                    </p>
                                                                )}
                                                                {mongodbConnection.metadata?.host && (
                                                                    <p className="text-xs text-secondary-600 dark:text-secondary-300">
                                                                        Host: <span className="font-medium">{mongodbConnection.metadata.host}</span>
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-secondary-600 dark:text-secondary-300 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                    Read-Only Access
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Spacer to push buttons to bottom */}
                                                    {!isConnected || (!githubConnection && !awsConnection && !mongodbConnection) ? <div className="flex-grow"></div> : null}

                                                    {/* Actions - Always at bottom */}
                                                    <div className="mt-auto">
                                                        {isConnected ? (
                                                            <div className="flex gap-2">
                                                                {integration.type === 'github' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => navigate('/github')}
                                                                            className="flex-1 px-2.5 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-1.5 text-xs sm:px-3 sm:py-2.5 sm:gap-2 sm:text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>Manage</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (githubConnection && window.confirm('Are you sure you want to disconnect GitHub?')) {
                                                                                    await handleDisconnectGitHub(githubConnection._id);
                                                                                }
                                                                            }}
                                                                            className="px-2.5 py-2 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md sm:px-3 sm:py-2.5 sm:text-sm"
                                                                            title="Disconnect GitHub"
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : integration.type === 'google' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => navigate('/google')}
                                                                            className="flex-1 px-2.5 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-1.5 text-xs sm:px-3 sm:py-2.5 sm:gap-2 sm:text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>Manage</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (googleConnection && window.confirm('Are you sure you want to disconnect Google?')) {
                                                                                    try {
                                                                                        await googleService.disconnectConnection(googleConnection._id);
                                                                                        const googleConn = await googleService.listConnections();
                                                                                        setGoogleConnections(googleConn);
                                                                                        refetch();
                                                                                    } catch (error) {
                                                                                        console.error('Failed to disconnect Google:', error);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="px-2.5 py-2 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md sm:px-3 sm:py-2.5 sm:text-sm"
                                                                            title="Disconnect Google"
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : integration.type === 'vercel' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setShowVercelPanel(true)}
                                                                            className="flex-1 px-2.5 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-1.5 text-xs sm:px-3 sm:py-2.5 sm:gap-2 sm:text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>Manage</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (vercelConnection) {
                                                                                    handleDisconnectVercel(vercelConnection._id);
                                                                                }
                                                                            }}
                                                                            className="px-2.5 py-2 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md sm:px-3 sm:py-2.5 sm:text-sm"
                                                                            title="Disconnect Vercel"
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : integration.type === 'aws' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (awsConnection) {
                                                                                    setSelectedAWSConnection(awsConnection);
                                                                                    setShowAWSPanel(true);
                                                                                }
                                                                            }}
                                                                            className="flex-1 px-2.5 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-1.5 text-xs sm:px-3 sm:py-2.5 sm:gap-2 sm:text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>Manage</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (awsConnection && window.confirm('Are you sure you want to disconnect AWS? This will revoke CostKatana access to your AWS account.')) {
                                                                                    try {
                                                                                        await awsService.deleteConnection(awsConnection.id);
                                                                                        loadIntegrationData();
                                                                                    } catch (error) {
                                                                                        console.error('Failed to disconnect AWS:', error);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="px-2.5 py-2 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md sm:px-3 sm:py-2.5 sm:text-sm"
                                                                            title="Disconnect AWS"
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : integration.type === 'mongodb' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowMongoDBPanel(true);
                                                                            }}
                                                                            className="flex-1 px-2.5 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-1.5 text-xs sm:px-3 sm:py-2.5 sm:gap-2 sm:text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>Manage</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (mongodbConnection && window.confirm('Are you sure you want to disconnect MongoDB? This will remove your MongoDB connection and database access.')) {
                                                                                    try {
                                                                                        await mongodbService.deleteConnection(mongodbConnection._id);
                                                                                        loadIntegrationData();
                                                                                    } catch (error) {
                                                                                        console.error('Failed to disconnect MongoDB:', error);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="px-2.5 py-2 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md sm:px-3 sm:py-2.5 sm:text-sm"
                                                                            title="Disconnect MongoDB"
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                // For Linear and JIRA, show integration details instead of setup
                                                                                if ((integration.type === 'linear' || integration.type === 'jira') && regularIntegrations.length > 0) {
                                                                                    // Show details for the first integration or allow selection
                                                                                    const firstIntegration = regularIntegrations[0];
                                                                                    setViewModal({ type: integration.type, integrationId: firstIntegration.id });
                                                                                } else {
                                                                                    // For other integrations, show setup to add more
                                                                                    setSetupModal(integration.type);
                                                                                }
                                                                            }}
                                                                            className="flex-1 px-2.5 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-1.5 text-xs sm:px-3 sm:py-2.5 sm:gap-2 sm:text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>{regularIntegrations.length > 1 ? 'Manage' : 'View'}</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (window.confirm(`Are you sure you want to disconnect all ${integration.name} integrations?`)) {
                                                                                    try {
                                                                                        for (const integ of regularIntegrations) {
                                                                                            await integrationService.deleteIntegration(integ.id);
                                                                                        }
                                                                                        refetch();
                                                                                    } catch (error) {
                                                                                        console.error('Failed to delete integrations:', error);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="px-2.5 py-2 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md sm:px-3 sm:py-2.5 sm:text-sm"
                                                                            title={`Disconnect ${integration.name}`}
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSetupModal(integration.type);
                                                                }}
                                                                className="w-full px-3 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-2 text-sm sm:px-4 sm:py-2.5"
                                                            >
                                                                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                <span>Connect</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Setup Modals */}
                {setupModal === 'github' && (
                    <GitHubConnector
                        onSelectRepository={handleSelectRepository}
                        onClose={() => setSetupModal(null)}
                    />
                )}
                {setupModal === 'slack' && (
                    <SlackIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'discord' && (
                    <DiscordIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'linear' && (
                    <LinearIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'jira' && (
                    <JiraIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'webhook' && (
                    <WebhookIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'vercel' && (
                    <VercelConnector
                        onConnect={() => {
                            setSetupModal(null);
                            loadIntegrationData();
                        }}
                        onClose={() => setSetupModal(null)}
                    />
                )}
                {setupModal === 'google' && (
                    <GoogleConnector
                        onConnect={() => {
                            setSetupModal(null);
                            handleSetupComplete();
                        }}
                        onClose={() => setSetupModal(null)}
                    />
                )}
                {setupModal === 'aws' && (
                    <AWSConnector
                        onConnect={() => {
                            setSetupModal(null);
                            loadIntegrationData();
                        }}
                        onClose={() => setSetupModal(null)}
                    />
                )}
                {setupModal === 'mongodb' && (
                    <MongoDBIntegrationPanel
                        isOpen={true}
                        onClose={() => {
                            setSetupModal(null);
                            loadIntegrationData();
                        }}
                        onSelectCommand={() => {
                            // Command selection handled in panel
                        }}
                    />
                )}

                {/* Linear Integration View Modal */}
                {viewModal && viewModal.type === 'linear' && (
                    <LinearIntegrationViewModal
                        integrationId={viewModal.integrationId}
                        onClose={() => setViewModal(null)}
                        onEdit={() => {
                            setViewModal(null);
                            setSetupModal('linear');
                        }}
                    />
                )}
                {/* JIRA Integration View Modal */}
                {viewModal && viewModal.type === 'jira' && (
                    <JiraIntegrationViewModal
                        integrationId={viewModal.integrationId}
                        onClose={() => setViewModal(null)}
                        onEdit={() => {
                            setViewModal(null);
                            setSetupModal('jira');
                        }}
                    />
                )}

                {/* Vercel Service Panel */}
                <VercelServicePanel
                    isOpen={showVercelPanel}
                    onClose={() => setShowVercelPanel(false)}
                />

                {/* AWS Service Panel */}
                <AWSServicePanel
                    isOpen={showAWSPanel}
                    onClose={() => {
                        setShowAWSPanel(false);
                        setSelectedAWSConnection(null);
                    }}
                    connection={selectedAWSConnection}
                    onRefresh={loadIntegrationData}
                />

                {/* MongoDB Integration Panel */}
                <MongoDBIntegrationPanel
                    isOpen={showMongoDBPanel}
                    onClose={() => {
                        setShowMongoDBPanel(false);
                        loadIntegrationData();
                    }}
                // Don't pass onSelectCommand - let the panel navigate to chat
                />

                {/* GitHub Feature Selector */}
                {showFeatureSelector && selectedRepo && (
                    <FeatureSelector
                        onConfirm={handleStartIntegration}
                        onClose={() => {
                            setShowFeatureSelector(false);
                            setSelectedRepo(null);
                        }}
                        repositoryName={selectedRepo.repo.name}
                        detectedLanguage={selectedRepo.repo.language}
                    />
                )}
            </div>
        </div>
    );
};

